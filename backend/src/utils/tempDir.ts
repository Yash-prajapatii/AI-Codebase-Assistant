import fs from "fs/promises";
import path from "path";
import os from "os";

export async function createTempDir(sessionId: string): Promise<string> {
  const base = path.join(
    os.tmpdir(),
    `rag-${sessionId}-${Date.now()}`
  );
  await fs.mkdir(base, { recursive: true });
  return base;
}

export async function removeTempDir(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (err) {
    // Log but never throw — cleanup failure must not surface to the user
    console.warn(`[tempDir] Failed to remove ${dirPath}:`, err);
  }
}