import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { analyzeRepository, fetchRouteMap } from "../services/api";
import { useRepoStore } from "../stores/repoStore";
import { useChatStore } from "../stores/chatStore";

// Session ID is module-level — stable for the lifetime of the analysis
let _sessionId = uuidv4();

export function getSessionId(): string {
  return _sessionId;
}

export function useRepoAnalysis() {
  const { setAnalyzing, setReady, setError, reset } = useRepoStore();
  const clearMessages = useChatStore((s) => s.clearMessages);

  const analyze = useCallback(
    async (repoUrl: string) => {
      // Generate a fresh session for every new analysis
      _sessionId = uuidv4();
      clearMessages();
      setAnalyzing(repoUrl);

      try {
        const result = await analyzeRepository({
          repoUrl,
          sessionId: _sessionId,
        });

        // Fetch the route map auto-discovered by the ingestion pipeline
        const routeMap = await fetchRouteMap(_sessionId).catch(() => []);

        setReady({
          repoUrl,
          repoName:   result.repoName,
          owner:      result.owner,
          fileCount:  result.fileCount,
          chunkCount: result.chunkCount,
          routeMap,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Analysis failed"
        );
      }
    },
    [setAnalyzing, setReady, setError, clearMessages]
  );

  const clear = useCallback(() => {
    _sessionId = uuidv4();
    reset();
    clearMessages();
  }, [reset, clearMessages]);

  return { analyze, clear };
}