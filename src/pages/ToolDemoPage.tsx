import { useState } from "react";
import { DemoShell } from "../components/demo/DemoShell";
import { LogPanel } from "../components/demo/LogPanel";
import { ResultPanel } from "../components/demo/ResultPanel";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Textarea } from "../components/ui/Textarea";
import { useDemoRequest } from "../hooks/useDemoRequest";
import { demoFetch } from "../lib/request";

export function ToolDemoPage() {
  const [input, setInput] = useState("帮我把一个 API 能力包装成客户演示脚本");
  const [logs, setLogs] = useState<string[]>([]);
  const request = useDemoRequest(async (prompt: string) => {
    setLogs(["读取输入", "调用 /api/mock/result", "整理展示结果"]);
    const response = await demoFetch<{ ok: true; data: unknown }>("/api/mock/result");
    return { prompt, result: response.data };
  });

  return (
    <DemoShell title="Tool Demo" badge="Input → Run → Output" description="用于快速验证工具型 Demo：把输入参数转成结构化结果，默认使用 Mock 数据，后续可替换为 /api/proxy。">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <label className="text-sm font-semibold text-slate-200">输入</label>
          <Textarea className="mt-3" value={input} onChange={(event) => setInput(event.target.value)} />
          <Button className="mt-4" disabled={request.loading} onClick={() => request.run(input)}>运行工具</Button>
        </Card>
        <ResultPanel loading={request.loading} error={request.error} data={request.data} />
      </div>
      <div className="mt-5"><LogPanel logs={logs} /></div>
    </DemoShell>
  );
}
