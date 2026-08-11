import path from "path";
import fs from "fs";

export const SUPPORTED_EXTENSIONS = new Set([
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
  ".md",
  ".sql",
]);

export const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  "dist",
  "build",
  ".git",
  ".github",
  ".next",
  ".nuxt",
  "coverage",
  ".nyc_output",
  "__pycache__",
  ".pytest_cache",
  "vendor",
  ".venv",
  "venv",
  ".idea",
  ".vscode",
  "out",
  "target",
  "bin",
  "obj",
]);

export const IGNORED_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  ".DS_Store",
  "Thumbs.db",
]);

export const LANGUAGE_MAP: Record<string, string> = {
  ".js": "javascript",
  ".ts": "typescript",
  ".jsx": "javascriptreact",
  ".tsx": "typescriptreact",
  ".json": "json",
  ".md": "markdown",
  ".sql": "sql",
};

export function isIgnoredDirectory(dirName: string): boolean {
  return IGNORED_DIRECTORIES.has(dirName);
}

export function isSupportedFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);
  if (IGNORED_FILES.has(base)) return false;
  return SUPPORTED_EXTENSIONS.has(ext);
}

export function getLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return LANGUAGE_MAP[ext] ?? "plaintext";
}

/**
 * Heuristic binary detection using synchronous fs read.
 * Checks the first 8KB for null bytes — correct for all common binary formats.
 * Uses fs directly (not require) for proper TypeScript typing.
 */
export function isBinaryFile(filePath: string): boolean {
  try {
    const SAMPLE_SIZE = 8192;
    const buffer = Buffer.alloc(SAMPLE_SIZE);
    const fd = fs.openSync(filePath, "r");
    const bytesRead = fs.readSync(fd, buffer, 0, SAMPLE_SIZE, 0);
    fs.closeSync(fd);
    for (let i = 0; i < bytesRead; i++) {
      if (buffer[i] === 0) return true;
    }
    return false;
  } catch {
    return true;
  }
}