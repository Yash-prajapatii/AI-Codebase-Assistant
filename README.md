# AI Codebase Assistant

> Chat with any GitHub repository in natural language — powered by RAG, Google Gemini, and agentic tool calls.

<!-- Replace with actual demo GIF once deployed -->
<!-- ![Demo](./assets/demo.gif) -->

🔗 **Live Demo:** _Coming soon_  
📦 **Frontend:** React + TypeScript + Vite → Vercel  
⚙️ **Backend:** Express.js + TypeScript → Render

---

## What Is This?

AI Codebase Assistant lets developers paste any public GitHub repository URL and immediately start asking questions about it in plain English.

No manual copy-pasting of files. No hitting context window limits. No losing track of which file said what.

The system reads, indexes, and understands the entire codebase — then answers questions with source citations pointing to the exact file and section the answer came from.

**Why not just use ChatGPT or Gemini directly?**

| | ChatGPT / Gemini | AI Codebase Assistant |
|---|---|---|
| Handles large repos | No — context window limit | Yes — entire repo indexed |
| Finds relevant code for you | No — you paste it manually | Yes — RAG retrieval |
| Remembers across questions | No — stateless | Yes — session store |
| Shows source citations | No | Yes — per answer |
| Acts autonomously | No | Yes — API Route Discovery tool |

---

## Features

- **Natural language chat** — ask questions about any public GitHub repo
- **Full repo ingestion** — clones, parses, and indexes 6+ file types (`.js`, `.ts`, `.jsx`, `.tsx`, `.json`, `.md`, `.sql`)
- **RAG pipeline** — retrieves only the most relevant code chunks per query using top-k cosine similarity search
- **Source citations** — every answer references the exact file it came from
- **Streaming responses** — real-time answer generation via Server-Sent Events (SSE)
- **API Route Discovery** — agentic tool call that autonomously maps all Express and Next.js routes on repo load, before you even ask
- **Quick actions** — preset prompt buttons for common tasks (summarize, find routes, explain architecture)
- **Session memory** — chat history and repo state persisted in-memory across the session

---

## Architecture

```
CLIENT (React + TypeScript + Vite)
┌─────────────────────────────────────────────────────┐
│  Repo URL Input  │  Chat Interface  │  Source Citations  │  Quick Actions  │
└────────────────────────────┬────────────────────────┘
                             │
                    POST /repo/analyze
                    POST /chat
                    GET  /chat/history
                             │
SERVER (Express.js + TypeScript)
┌────────────────────────────▼────────────────────────┐
│                                                      │
│   INGESTION PIPELINE          RETRIEVAL PIPELINE     │
│   ─────────────────           ─────────────────────  │
│   GitHub Repo Cloner    →     Query Encoder          │
│   File Parser           →     Vector Retriever       │
│   Chunker (recursive)   →     Context Builder        │
│   Embedder              →     Prompt Composer        │
│                                                      │
│   STORAGE LAYER                                      │
│   ChromaDB (embeddings + metadata per repo)          │
│   In-memory store (chat history, session state)      │
│                                                      │
│   AI LAYER                                           │
│   Google Gemini API (gemini-1.5-flash) — streaming   │
│   Google text-embedding-004 — vector encoding        │
└──────────────────────────────────────────────────────┘
```

**Ingestion flow:**
```
Repo URL → clone → parse files → chunk with metadata → embed → index into ChromaDB
```

**Chat flow:**
```
User message → embed query → top-k similarity search → assemble context + sources → compose prompt → stream Gemini response via SSE
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, TypeScript, Vite, HTML5, CSS3 |
| Backend | Node.js, Express.js, TypeScript |
| AI / RAG | LangChain.js, Google Gemini API (gemini-1.5-flash) |
| Embeddings | Google text-embedding-004 |
| Vector Store | ChromaDB |
| Streaming | Server-Sent Events (SSE) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
ai-codebase-assistant/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── chat/           # ChatWindow, ChatMessage, ChatInput, StreamingText, CodeBlock
│       │   ├── sidebar/        # QuickActions, RepoStatus
│       │   ├── repo/           # RepoInput, AnalysisProgress
│       │   └── citations/      # SourceCitations
│       ├── hooks/              # useChat, useRepoAnalysis, useSSEStream
│       ├── stores/             # chatStore, repoStore
│       └── services/           # api.ts
│
└── backend/
    └── src/
        ├── routes/             # repo.routes.ts, chat.routes.ts
        ├── controllers/        # repo.controller.ts, chat.controller.ts
        ├── services/           # github, fileParser, chunker, embeddings, vectorStore, retriever, claude
        ├── rag/                # ingestion.pipeline.ts, retrieval.pipeline.ts
        ├── store/              # session.store.ts, repo.store.ts
        └── middleware/         # errorHandler, requestLogger, cors
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+ (for ChromaDB)
- Google Gemini API key — [get one here](https://aistudio.google.com/)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Yash-prajapatii/AI-Codebase-Assistant.git
cd AI-Codebase-Assistant
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Set up environment variables

**Backend `.env`:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
CHROMA_DB_PATH=./chromadb
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3001
```

### 4. Start ChromaDB

```bash
pip install chromadb
chroma run --path ./chromadb
```

### 5. Run the application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` and paste any public GitHub repo URL to get started.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/repo/analyze` | Clone, parse, chunk, embed, and index a GitHub repository |
| `POST` | `/chat` | Send a message — returns SSE stream with RAG-retrieved response |
| `GET` | `/chat/history` | Retrieve in-memory chat history for current session |

---

## How the RAG Pipeline Works

### Ingestion (run once per repo)

1. **Clone** — `simple-git` clones the repo to a temp directory, filtering out `node_modules`, `.git`, build artifacts
2. **Parse** — File parser extracts content from `.js`, `.ts`, `.jsx`, `.tsx`, `.json`, `.md`, `.sql` files
3. **Chunk** — Recursive character splitter breaks files into overlapping chunks with file path and line range metadata
4. **Embed** — Google `text-embedding-004` converts each chunk into a 768-dimensional vector
5. **Index** — Vectors and metadata stored in ChromaDB, namespaced per repository URL

### Retrieval (run on every chat message)

1. **Encode query** — User's question embedded using the same `text-embedding-004` model
2. **Search** — Top-k chunks retrieved from ChromaDB using cosine similarity
3. **Build context** — Retrieved chunks assembled with file path citations
4. **Compose prompt** — System prompt + chat history + context chunks sent to Gemini
5. **Stream response** — Gemini streams the answer token-by-token via SSE to the frontend

---

## Agentic Feature: API Route Discovery

On every new repository load, the system automatically invokes an agentic tool call that:

- Traverses all parsed files looking for route pattern signatures
- Identifies Express (`router.get`, `app.post`, etc.) and Next.js (`/pages/api/`, `/app/api/`) route definitions
- Returns a structured route map with HTTP method, path, and source file
- Displays the map in the UI before the user asks any questions

This is proactive agentic reasoning — the system takes action without being prompted.

---

## Roadmap

- [ ] Deploy frontend to Vercel + backend to Render
- [ ] Add support for private repositories (GitHub OAuth)
- [ ] Persistent ChromaDB across sessions (currently resets on server restart)
- [ ] Multi-repo support in a single session
- [ ] Add more tool calls (dependency graph, test coverage map, PR diff analysis)
- [ ] Export chat as markdown

---

## Author

**Yash Prajapati**  
[LinkedIn](https://linkedin.com/in/yash-prajapati-/) · [GitHub](https://github.com/Yash-prajapatii)

---

## License

MIT
