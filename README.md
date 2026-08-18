# AI Codebase Assistant

> Chat with any public GitHub repository using natural language — powered by RAG, Google Gemini, and LangChain.

**Live demo:** [ai-codebase-assistant-zeta.vercel.app](https://ai-codebase-assistant-zeta.vercel.app)

---

## Overview

AI Codebase Assistant lets developers paste any public GitHub repository URL and immediately ask questions about it in plain English.

The system clones the repository, parses and chunks its source files, generates vector embeddings, and stores them in ChromaDB. When you ask a question, it retrieves the most semantically relevant code chunks, injects them as context into a Gemini prompt, and streams the answer back token-by-token — with citations showing exactly which files the answer came from.

---

## Features

- **Full repository ingestion** — shallow-clones repos, parses 7 file types, chunks with language-aware separators, and indexes into ChromaDB
- **RAG-based retrieval** — embeds each query and retrieves the top-8 most similar chunks via cosine similarity before generating an answer
- **Streaming responses** — answers stream token-by-token via Server-Sent Events; no waiting for the full response
- **Source citations** — every answer includes the exact file paths it drew from
- **API Route Discovery** — a LangChain `DynamicTool` runs automatically after ingestion, scanning parsed files for Express and Next.js route patterns and surfacing a structured route map in the UI
- **Quick actions** — eight preset prompts (Architecture Overview, Generate README, Find Bugs, Explain Auth, Explain API Structure, Summarize, Suggest Improvements, Analyze Dependencies)
- **Session memory** — chat history is stored in-memory per session and included in each Gemini request for multi-turn context
- **Rate limiting and security** — Helmet, CORS, and per-endpoint rate limiting on the ingestion endpoint
- **Classified error handling** — frontend maps backend error codes to friendly, actionable messages (quota exceeded, clone timeout, private repo, etc.)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              React + TypeScript + Vite              │
│  Repo Input  │  Chat Window  │  Route Map  │ Sidebar│
└──────────────────────┬──────────────────────────────┘
                       │ REST + SSE
          ┌────────────▼────────────────┐
          │   Express.js + TypeScript   │
          │                             │
          │  POST /repo/analyze         │
          │  ┌──────────────────────┐   │
          │  │  Ingestion Pipeline  │   │
          │  │  1. git clone        │   │
          │  │  2. parse files      │   │
          │  │  3. chunk content    │   │
          │  │  4. embed chunks     │   │
          │  │  5. index → Chroma   │   │
          │  │  6. discover routes  │   │
          │  └──────────────────────┘   │
          │                             │
          │  POST /chat  (SSE)          │
          │  ┌──────────────────────┐   │
          │  │  Retrieval Pipeline  │   │
          │  │  1. embed query      │   │
          │  │  2. cosine search    │   │
          │  │  3. build context    │   │
          │  │  4. stream Gemini    │   │
          │  └──────────────────────┘   │
          └────────────┬────────────────┘
                       │
         ┌─────────────▼──────────────┐
         │   ChromaDB  (v2 API)       │
         │   cosine similarity index  │
         │   768-dim embeddings       │
         └────────────────────────────┘
                       │
         ┌─────────────▼──────────────┐
         │   Google Gemini API        │
         │   gemini-embedding-001     │
         │   gemini-3.5-flash (chat)  │
         └────────────────────────────┘
```

---

## RAG Pipeline

### Ingestion (once per repository)

1. **Clone** — `simple-git` shallow-clones the repo (`--depth 1 --single-branch --no-tags`) into a temporary directory, with a configurable timeout. The temp directory is always deleted after ingestion, whether or not it succeeds.
2. **Parse** — walks the directory tree recursively, skipping ignored directories (`node_modules`, `dist`, `.git`, `.next`, etc.) and filtering to supported file types. Binary files are detected by scanning the first 8KB for null bytes. Files over `MAX_FILE_SIZE_BYTES` (default 512KB) are skipped.
3. **Chunk** — LangChain's `RecursiveCharacterTextSplitter` splits each file using language-aware separators. TypeScript and JavaScript files split on class/function/export boundaries before falling back to newlines. Default chunk size: 1200 characters with 200-character overlap. Each chunk carries metadata: file path, language, start/end line, chunk index.
4. **Embed** — chunks are batched in groups of 100 and embedded using `gemini-embedding-001` with `RETRIEVAL_DOCUMENT` task type, producing 768-dimensional vectors (MRL-scaled from the default 3072).
5. **Index** — vectors and metadata are upserted into a ChromaDB collection namespaced by session ID, using cosine similarity as the distance metric.
6. **Route discovery** — a LangChain `DynamicTool` receives the parsed file list and scans for Express route registrations (`router.get`, `app.post`, etc.) and Next.js App Router / Pages Router patterns. Results are stored in the session and rendered in the sidebar immediately.

### Retrieval (every chat message)

1. **Embed query** — the user's question is embedded using `gemini-embedding-001` with `RETRIEVAL_QUERY` task type (a different internal representation optimised for asymmetric retrieval).
2. **Search** — top-8 chunks retrieved from the session's ChromaDB collection by cosine similarity.
3. **Build context** — retrieved chunks are formatted with file path and line range, then injected into the Gemini system prompt alongside the full chat history.
4. **Stream** — `ai.models.generateContentStream()` streams the response. SSE headers are set only after the stream is successfully acquired, so a transient 503 can be retried before the response is committed. Tokens are written as `data: {"type":"token","token":"..."}` events. A final `data: {"type":"done","sourceFiles":[...]}` event carries the citation list.

---

## Route Discovery Tool

After ingestion, a LangChain `DynamicTool` named `route_discovery` receives the full list of parsed files as JSON and performs static analysis:

- **Express** — matches `router.get(...)`, `app.post(...)`, etc. using regex, extracting the HTTP method, path string, source file, and line number
- **Next.js App Router** — detects files under `app/api/` and matches exported `GET`, `POST`, `PUT`, `PATCH`, `DELETE` function declarations
- **Next.js Pages Router** — detects files under `pages/api/` with a default export

Results are deduplicated and stored in the session. The route map is fetched immediately after ingestion completes and displayed in the sidebar as a collapsible panel — before the user asks any questions.

This is a static analysis tool, not an LLM-driven agent. It runs deterministically on every repository without requiring a Gemini API call.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3, Zustand |
| Markdown rendering | react-markdown, rehype-highlight, remark-gfm, highlight.js |
| Backend | Node.js 20, Express 4, TypeScript 5 |
| AI — Chat | Google Gemini (`gemini-3.5-flash`) via `@google/genai` |
| AI — Embeddings | Google `gemini-embedding-001`, 768-dim via `@google/genai` |
| RAG / Tooling | LangChain JS (`langchain`, `@langchain/core`, `@langchain/community`) |
| Vector store | ChromaDB v3 JS client, self-hosted ChromaDB server (v2 API) |
| Git | simple-git |
| Validation | Zod (environment variables) |
| Security | Helmet, express-rate-limit |
| Frontend deployment | Vercel |
| Backend deployment | Render (Node.js web service) |
| ChromaDB deployment | Render (separate web service with persistent disk) |

---

## Project Structure

```
ai-codebase-assistant/
├── backend/
│   └── src/
│       ├── app.ts                    # Express app, middleware, routes, rate limiting
│       ├── config/index.ts           # Zod-validated environment config
│       ├── controllers/
│       │   ├── repo.controller.ts    # POST /repo/analyze, GET /repo/routes
│       │   └── chat.controller.ts    # POST /chat (SSE), GET /chat/history
│       ├── rag/
│       │   ├── ingestion.pipeline.ts # Orchestrates clone → parse → chunk → embed → index
│       │   └── retrieval.pipeline.ts # Embed query → search → stream response
│       ├── services/
│       │   ├── github.service.ts     # shallow clone with timeout
│       │   ├── fileParser.service.ts # directory walk, file filtering
│       │   ├── chunker.service.ts    # language-aware RecursiveCharacterTextSplitter
│       │   ├── embeddings.service.ts # gemini-embedding-001, batched
│       │   ├── vectorStore.service.ts# ChromaDB client, upsert, cosine search
│       │   └── gemini.service.ts     # generateContentStream, SSE, 503 retry
│       ├── tools/
│       │   └── routeDiscovery.tool.ts# LangChain DynamicTool, Express + Next.js patterns
│       ├── store/session.store.ts    # In-memory session store (chat history, routeMap)
│       ├── middleware/               # CORS, error handler, request logger, timing logger
│       └── utils/
│           ├── fileFilters.ts        # SUPPORTED_EXTENSIONS, IGNORED_DIRECTORIES, binary check
│           └── tempDir.ts            # Create/remove per-session temp clone directories
│
└── frontend/
    └── src/
        ├── components/
        │   ├── chat/                 # ChatWindow, ChatMessage, ChatInput, StreamingText, CodeBlock
        │   ├── sidebar/              # Sidebar, RepoStatus, RouteMap, QuickActions
        │   ├── repo/                 # RepoInput, AnalysisProgress
        │   ├── citations/            # SourceCitations
        │   └── ui/                   # Toast, Spinner, Badge, ErrorCard
        ├── hooks/
        │   ├── useRepoAnalysis.ts    # Triggers ingestion, fetches route map
        │   ├── useSSEStream.ts       # Reads SSE byte stream, appends tokens to store
        │   └── useChat.ts            # Sends messages, guards on repo status
        ├── stores/
        │   ├── repoStore.ts          # status, repoUrl, fileCount, chunkCount, routeMap
        │   └── chatStore.ts          # messages[], isStreaming
        └── services/api.ts           # fetch wrappers for all backend endpoints
```

---

## Getting Started

### Prerequisites

- Node.js 20 (see `.nvmrc`)
- Python 3.8+ (to run ChromaDB)
- A Google Gemini API key — [get one here](https://aistudio.google.com/app/apikey) (free tier)

### 1. Clone

```bash
git clone https://github.com/Yash-prajapatii/AI-Codebase-Assistant.git
cd AI-Codebase-Assistant
nvm use   # uses .nvmrc
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env   # then fill in your values
```

Required variable:

```
GEMINI_API_KEY=your_key_here
```

Key optional variables (defaults shown):

```
PORT=3001
CORS_ORIGIN=http://localhost:5173
CHROMA_URL=http://localhost:8000
CLONE_TIMEOUT_MS=180000
MAX_REPO_FILES=1000
MAX_FILE_SIZE_BYTES=524288
CHUNK_SIZE=1200
CHUNK_OVERLAP=200
RETRIEVER_TOP_K=8
EMBEDDING_DIMENSIONS=768
GEMINI_MODEL=gemini-3.5-flash
```

### 4. Start ChromaDB

```bash
pip install chromadb
chroma run --host localhost --port 8000 --path ./chroma-data
```

### 5. Start the backend

```bash
cd backend
npm run dev
```

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), paste a public GitHub URL, and click **Analyze**.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check — returns `{ status, timestamp }` |
| `POST` | `/repo/analyze` | Clone, parse, chunk, embed, and index a repository. Body: `{ repoUrl, sessionId }`. Returns repo metadata and chunk counts. |
| `GET` | `/repo/routes?sessionId=` | Returns the route map discovered during ingestion. |
| `POST` | `/chat` | Send a message. Body: `{ sessionId, message }`. Returns an SSE stream of `token` and `done` events. |
| `GET` | `/chat/history/:sessionId` | Returns the full in-memory chat history for the session. |

### SSE event format (`POST /chat`)

```
data: {"type":"token","token":"Hello"}
data: {"type":"token","token":" world"}
data: {"type":"done","sourceFiles":["src/app.ts","src/routes/index.ts"]}
```

---

## Supported File Types

| Extension | Language |
|-----------|---------|
| `.ts` | TypeScript |
| `.tsx` | TypeScript (React) |
| `.js` | JavaScript |
| `.jsx` | JavaScript (React) |
| `.json` | JSON |
| `.md` | Markdown |
| `.sql` | SQL |

Files such as `.yml`, `.yaml`, `.prisma`, `.env`, `Dockerfile`, and binary files are not parsed.

---

## Limitations

| Limitation | Detail |
|------------|--------|
| **Public repos only** | Private repositories require a `GITHUB_TOKEN` with `repo` scope set in the backend environment |
| **Gemini free-tier quota** | `gemini-embedding-001` has a daily request limit. A 791-chunk repository requires ~8 embedding API calls. Heavy usage across sessions can exhaust the daily quota; the backend returns HTTP 429 with a clear message when this happens |
| **Repository size** | `MAX_REPO_FILES=1000` caps the number of parsed files. Files over 512KB are skipped. Very large repositories may be partially indexed |
| **Session persistence** | Chat history and indexed collections exist only for the current server process. Restarting the backend clears all sessions; repositories must be re-analyzed |
| **ChromaDB on free tier** | The Render-hosted ChromaDB instance spins down after inactivity. The first request after a cold start may take 20–30 seconds for Chroma to wake up |
| **Clone timeout** | Default 180-second timeout. Very large repositories or slow connections may still time out at the clone stage |
| **Supported languages** | Only the 7 file types above are parsed. Repositories written primarily in Python, Go, Java, or Rust will index only their JSON and Markdown files |

---

## Deployment

The application is deployed across three services:

**Frontend → Vercel**
React app deployed to Vercel. A `vercel.json` rewrite proxies `/api/*` to the Render backend URL. `Cache-Control: no-store` is set on `/api/*` to prevent Vercel's edge from buffering SSE responses.

**Backend → Render (Node.js Web Service)**
Express app built with `npm run build` (TypeScript → `dist/`) and started with `node dist/app.js`. All environment variables set in the Render dashboard.

**ChromaDB → Render (separate Web Service)**
ChromaDB runs as a Python web service on Render with a persistent disk mounted at `/data`. The backend connects via HTTPS using the Render service URL.

---

## Roadmap

- [ ] Persist ChromaDB collections across backend restarts (currently lost on redeploy)
- [ ] Support private repositories via GitHub OAuth
- [ ] Expand supported file types (`.py`, `.go`, `.java`, `.yaml`)
- [ ] Priority-based ingestion for large repositories (score files by architectural importance before applying any chunk cap)
- [ ] Multi-repo sessions

---

## Author

**Yash Prajapati**
[GitHub](https://github.com/Yash-prajapatii) · [LinkedIn](https://linkedin.com/in/yash-prajapati-/)

---

## License

MIT
