import fs from "fs/promises";
import path from "path";
import { ParsedFile, NoSupportedFilesError } from "../types/index.js";
import {
  isIgnoredDirectory,
  isSupportedFile,
  isBinaryFile,
  getLanguage,
} from "../utils/fileFilters.js";
import { config } from "../config/index.js";

async function walkDirectory(
  dirPath: string,
  repoRoot: string,
  files: ParsedFile[]
): Promise<void> {
  if (files.length >= config.MAX_REPO_FILES) return;

  let entries;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return; // skip unreadable directories silently
  }

  for (const entry of entries) {
    if (files.length >= config.MAX_REPO_FILES) break;

    const absolutePath = path.join(dirPath, entry.name);
    const relativePath = path.relative(repoRoot, absolutePath);

    if (entry.isDirectory()) {
      if (!isIgnoredDirectory(entry.name)) {
        await walkDirectory(absolutePath, repoRoot, files);
      }
      continue;
    }

    if (!entry.isFile()) continue;
    if (!isSupportedFile(absolutePath)) continue;

    let stat;
    try {
      stat = await fs.stat(absolutePath);
    } catch {
      continue;
    }

    if (stat.size > config.MAX_FILE_SIZE_BYTES) continue;
    if (stat.size === 0) continue;
    if (isBinaryFile(absolutePath)) continue;

    let content: string;
    try {
      content = await fs.readFile(absolutePath, "utf-8");
    } catch {
      continue;
    }

    files.push({
      filePath: relativePath,
      absolutePath,
      content,
      extension: path.extname(entry.name).toLowerCase(),
      sizeBytes: stat.size,
      language: getLanguage(absolutePath),
    });
  }
}

export async function parseRepository(
  repoRoot: string,
  repoName: string
): Promise<ParsedFile[]> {
  const files: ParsedFile[] = [];
  await walkDirectory(repoRoot, repoRoot, files);

  if (files.length === 0) {
    throw new NoSupportedFilesError(repoName);
  }

  console.log(`[fileParser] Parsed ${files.length} files from ${repoName}`);
  return files;
}