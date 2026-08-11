import { create } from "zustand";
import type { RepoState } from "../types";

interface RepoStore extends RepoState {
  setAnalyzing: (url: string) => void;
  setReady: (data: Omit<RepoState, "status" | "error">) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const initialState: RepoState = {
  status:   "idle",
  repoUrl:  "",
  repoName: "",
  owner:    "",
  fileCount:  0,
  chunkCount: 0,
  error:    null,
  routeMap: [],
};

export const useRepoStore = create<RepoStore>((set) => ({
  ...initialState,

  setAnalyzing: (url) =>
    set({ status: "analyzing", repoUrl: url, error: null }),

  setReady: (data) =>
    set({ status: "ready", error: null, ...data }),

  setError: (error) =>
    set({ status: "error", error }),

  reset: () => set(initialState),
}));