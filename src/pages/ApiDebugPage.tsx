import { useState } from "react";
import { DemoShell } from "../components/demo/DemoShell";
import { JsonViewer } from "../components/demo/JsonViewer";
import { ResultPanel } from "../components/demo/ResultPanel";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { useDemoRequest } from "../hooks/useDemoRequest";
import { demoFetch } from "../lib/request";

const presets = ["/api/health", "/api/mock/result", "/api/mock/products", "/api/access/status", "/api/proxy/custom/get"];

export function ApiDebugPage() {
  const [url, setUrl] = useState(presets[0]);
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState('{\n  "hello": "DemoKit"\n}');
  const request = useDemoRequest(async () => {
    return demoFetch(url, {
      method,
      body: method === "GET" ? undefined : JSON.parse(body || "{}")
    });
  });

  return (
    <DemoShell title="API Debug Demo" badge="/api/*" description="用于验收本地 API、Mock、访问控制和代理能力。代理使用服务端白名单配置，不支持任意开放 URL。">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <select className="rounded-2xl border border-slate-500/30 bg-slate-950/60 px-3 py-3" value={method} onChange={(event) => setMethod(event.target.value)}>
              <option>GET</option>
              <option>POST</option>
            </select>
            <Input value={url} onChange={(event) => setUrl(event.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((item) => <button key={item} className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300" onClick={() => setUrl(item)}>{item}</button>)}
          </div>
          <Textarea value={body} onChange={(event) => setBody(event.target.value)} />
          <Button disabled={request.loading} onClick={() => request.run(undefined)}>发送请求</Button>
        </Card>
        <ResultPanel loading={request.loading} error={request.error} data={request.data} />
      </div>
      <div className="mt-5"><JsonViewer data={{ tip: "把 CUSTOM_API_BASE_URL 配成 https://httpbin.org 后，可测试 /api/proxy/custom/get" }} /></div>
    </DemoShell>
  );
}
