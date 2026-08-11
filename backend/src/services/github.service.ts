import simpleGit, { SimpleGit } from "simple-git";
import {
  CloneResult,
  CloneTimeoutError,
  InvalidRepoUrlError,
} from "../types/index.js";
import { config } from "../config/index.js";

// Only accept well-formed github.com HTTPS URLs
// Rejects: git://, ssh://, file://, subdomain tricks, path traversal
const GITHUB_URL_PATTERN =
  /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(\.git)?$/;

export function parseGitHubUrl(url: string): {
  owner: string;
  repo: string;
} {
  const trimmed = url.trim().replace(/\/$/, "");
  const match = trimmed.match(GITHUB_URL_PATTERN);
  if (!match) throw new InvalidRepoUrlError(url);
  return { owner: match[1], repo: match[2] };
}

function buildAuthenticatedUrl(url: string): string {
  if (!config.GITHUB_TOKEN) return url;
  const { owner, repo } = parseGitHubUrl(url);
  return `https://${config.GITHUB_TOKEN}@github.com/${owner}/${repo}.git`;
}

export async function cloneRepository(
  repoUrl: string,
  destPath: string
): Promise<CloneResult> {
  const { owner, repo } = parseGitHubUrl(repoUrl);
  const authenticatedUrl = buildAuthenticatedUrl(repoUrl);

  const git: SimpleGit = simpleGit();

  const clonePromise = git.clone(authenticatedUrl, destPath, [
    "--depth",
    "1",
    "--single-branch",
    "--no-tags",
  ]);

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new CloneTimeoutError(repoUrl)),
      config.CLONE_TIMEOUT_MS
    )
  );

  await Promise.race([clonePromise, timeoutPromise]);

  // Detect default branch from the cloned repo
  let defaultBranch = "main";
  try {
    const clonedGit = simpleGit(destPath);
    const branches = await clonedGit.branchLocal();
    defaultBranch = branches.current || "main";
  } catch {
    // non-fatal — default to "main"
  }

  return {
    localPath: destPath,
    repoName: repo,
    owner,
    defaultBranch,
    clonedAt: new Date(),
  };
}