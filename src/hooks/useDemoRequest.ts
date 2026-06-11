import { useCallback, useState } from "react";
import { type AppError, toAppError } from "../lib/errors";

export type DemoRequestStatus = "idle" | "loading" | "success" | "error";

export function useDemoRequest<TInput, TOutput>(requestFn: (input: TInput) => Promise<TOutput>) {
  const [status, setStatus] = useState<DemoRequestStatus>("idle");
  const [data, setData] = useState<TOutput | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const run = useCallback(
    async (input: TInput) => {
      setStatus("loading");
      setError(null);

      try {
        const result = await requestFn(input);
        setData(result);
        setStatus("success");
        return result;
      } catch (err) {
        const appError = toAppError(err);
        setError(appError);
        setStatus("error");
        throw appError;
      }
    },
    [requestFn]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setData(null);
    setError(null);
  }, []);

  return { run, reset, status, loading: status === "loading", data, error };
}
