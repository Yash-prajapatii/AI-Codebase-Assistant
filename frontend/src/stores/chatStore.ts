import { create } from "zustand";
import type { ChatMessage } from "../types";

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  addMessage: (msg: ChatMessage) => void;
  appendToken: (id: string, token: string) => void;
  finalizeMessage: (id: string, sourceFiles: string[]) => void;
  setStreaming: (v: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages:    [],
  isStreaming: false,

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  appendToken: (id, token) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + token } : m
      ),
    })),

  finalizeMessage: (id, sourceFiles) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, streaming: false, sourceFiles } : m
      ),
    })),

  setStreaming: (v) => set({ isStreaming: v }),

  clearMessages: () => set({ messages: [], isStreaming: false }),
}));