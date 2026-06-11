import { useState } from "react";
import { DemoShell } from "../components/demo/DemoShell";
import { LogPanel } from "../components/demo/LogPanel";
import { ResultPanel } from "../components/demo/ResultPanel";
import { StepRunner } from "../components/demo/StepRunner";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { demoFetch } from "../lib/request";

type WorkflowData = {
  steps: { title: string; description: string }[];
  summary: string;
};

export function WorkflowDemoPage() {
  const [data, setData] = useState<WorkflowData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setLogs(["初始化流程", "读取 Mock 工作流", "输出步骤和结论"]);
    try {
      const response = await demoFetch<{ ok: true; data: WorkflowData }>("/api/mock/workflow");
      setData(response.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell title="Workflow Demo" badge="Step Runner" description="展示 Agent、审批、数据处理等多步骤流程，适合客户 PoC 和方案演示。">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <Button disabled={loading} onClick={run}>{loading ? "执行中..." : "运行流程"}</Button>
          <div className="mt-5"><StepRunner steps={(data?.steps || []).map((step) => ({ ...step, status: "done" }))} /></div>
        </Card>
        <ResultPanel loading={loading} data={data?.summary || null} />
      </div>
      <div className="mt-5"><LogPanel logs={logs} /></div>
    </DemoShell>
  );
}
