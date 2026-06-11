import { type AppError } from "../../lib/errors";
import { Card } from "../ui/Card";
import { JsonViewer } from "./JsonViewer";
import { MarkdownViewer } from "./MarkdownViewer";

type ResultPanelProps = {
  title?: string;
  loading?: boolean;
  error?: AppError | null;
  data?: unknown;
};

export function ResultPanel({ title = "结果", loading, error, data }: ResultPanelProps) {
  return (
    <Card className="min-h-72">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {loading ? <span className="text-xs text-emerald-200">运行中...</span> : null}
      </div>
      {error ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-100">
          <div className="font-semibold">{error.code}</div>
          <div>{error.message}</div>
        </div>
      ) : loading ? (
        <div className="h-40 animate-pulse rounded-3xl bg-slate-800/60" />
      ) : typeof data === "string" ? (
        <MarkdownViewer content={data} />
      ) : data ? (
        <JsonViewer data={data} />
      ) : (
        <p className="text-sm text-slate-400">运行 Demo 后，结果会显示在这里。</p>
      )}
    </Card>
  );
}
