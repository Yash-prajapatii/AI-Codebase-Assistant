import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { v4 as uuidv4 } from "uuid";
import { ParsedFile, DocumentChunk } from "../types/index.js";
import { config } from "../config/index.js";

// Language-aware separators keep logical code blocks intact during splitting.
// TypeScript/JS prefer class/function/export boundaries over raw newlines.
const SEPARATORS_BY_LANGUAGE: Record<string, string[]> = {
  typescript: [
    "\nclass ",
    "\nfunction ",
    "\nconst ",
    "\nexport ",
    "\n\n",
    "\n",
    " ",
  ],
  typescriptreact: [
    "\nconst ",
    "\nfunction ",
    "\nexport ",
    "\n\n",
    "\n",
    " ",
  ],
  javascript: [
    "\nfunction ",
    "\nconst ",
    "\nexport ",
    "\n\n",
    "\n",
    " ",
  ],
  javascriptreact: [
    "\nconst ",
    "\nfunction ",
    "\nexport ",
    "\n\n",
    "\n",
    " ",
  ],
  sql: [
    "\nCREATE ",
    "\nSELECT ",
    "\nINSERT ",
    "\nUPDATE ",
    "\nDELETE ",
    "\n\n",
    "\n",
  ],
  markdown: ["\n## ", "\n### ", "\n#### ", "\n\n", "\n", " "],
  json: ["\n", " "],
};

function getSeparators(language: string): string[] {
  return SEPARATORS_BY_LANGUAGE[language] ?? ["\n\n", "\n", " "];
}

export async function chunkFiles(
  files: ParsedFile[],
  sessionId: string,
  repoName: string
): Promise<DocumentChunk[]> {
  const allChunks: DocumentChunk[] = [];

  for (const file of files) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.CHUNK_SIZE,
      chunkOverlap: config.CHUNK_OVERLAP,
      separators: getSeparators(file.language),
    });

    const langchainDocs = await splitter.createDocuments(
      [file.content],
      [{ source: file.filePath }]
    );

    langchainDocs.forEach((doc, idx) => {
      const startLine = doc.metadata.loc?.lines?.from ?? 1;
      const endLine =
        doc.metadata.loc?.lines?.to ??
        startLine + doc.pageContent.split("\n").length - 1;

      allChunks.push({
        id: uuidv4(),
        content: doc.pageContent,
        metadata: {
          filePath: file.filePath,
          language: file.language,
          chunkIndex: idx,
          totalChunks: langchainDocs.length,
          startLine,
          endLine,
          repoName,
          sessionId,
        },
      });
    });
  }

  console.log(
    `[chunker] Produced ${allChunks.length} chunks from ${files.length} files`
  );
  return allChunks;
}