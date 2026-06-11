import { Card } from "../ui/Card";

export function LogPanel({ logs }: { logs: string[] }) {
  return (
    <Card className="p-4">
      <div className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">Execution Log</div>
      <div className="space-y-2 font-mono text-xs text-slate-300">
        {logs.length ? logs.map((log, index) => <div key={`${log}-${index}`}>[{String(index + 1).padStart(2, "0")}] {log}</div>) : <div>暂无日志</div>}
      </div>
    </Card>
  );
}
