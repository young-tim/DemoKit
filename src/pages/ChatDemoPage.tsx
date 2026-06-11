import { useState } from "react";
import { DemoShell } from "../components/demo/DemoShell";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { demoFetch } from "../lib/request";

type Message = { role: "user" | "assistant"; content: string };

export function ChatDemoPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "你好，我是 DemoKit 的 Mock 助手。" }]);
  const [input, setInput] = useState("如何把这个 Demo 部署到 Vercel？");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const response = await demoFetch<{ ok: true; data: { reply: string } }>("/api/mock/chat");
      setMessages([...next, { role: "assistant", content: response.data.reply }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell title="Chat Demo" badge="Mock Chat" description="对话型 AI 应用骨架。第一版不做流式输出，但保留消息列表、模型选择和发送结构。">
      <Card className="mx-auto max-w-4xl">
        <div className="mb-4 flex justify-between text-sm text-slate-400"><span>模型：mock-assistant</span><button onClick={() => setMessages([])}>清空</button></div>
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={message.role === "user" ? "ml-auto max-w-[80%] rounded-3xl bg-emerald-300 p-4 text-slate-950" : "max-w-[80%] rounded-3xl bg-slate-800 p-4 text-slate-100"}>{message.content}</div>
          ))}
        </div>
        <div className="mt-5 flex gap-3">
          <Input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} />
          <Button disabled={loading} onClick={send}>{loading ? "发送中" : "发送"}</Button>
        </div>
      </Card>
    </DemoShell>
  );
}
