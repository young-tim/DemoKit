import { Card } from "../ui/Card";

export function JsonViewer({ data }: { data: unknown }) {
  return (
    <Card className="overflow-auto bg-slate-950/70 p-4">
      <pre className="m-0 text-xs leading-6 text-emerald-100">{JSON.stringify(data, null, 2)}</pre>
    </Card>
  );
}
