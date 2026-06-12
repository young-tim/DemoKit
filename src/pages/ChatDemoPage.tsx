import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, KeyRound, LoaderCircle, SendHorizonal, Sparkles, X } from "lucide-react";
import { DemoShell } from "../components/demo/DemoShell";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Textarea } from "../components/ui/Textarea";

type MessageRole = "user" | "assistant";

type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
};

type Message = {
  id: string;
  role: MessageRole;
  content: string;
  attachments?: Attachment[];
};

const API_KEY_STORAGE_KEY = "demokit.chat.apiKey";
const BASE_URL_STORAGE_KEY = "demokit.chat.baseUrl";

const modelOptions = [
  { value: "mock-assistant", label: "Mock Assistant" },
  { value: "gpt-4o-mini", label: "GPT-4o mini" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 mini" },
  { value: "deepseek-chat", label: "DeepSeek Chat" },
  { value: "qwen-plus", label: "Qwen Plus" }
];

function createId() {
  return crypto.randomUUID();
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function localStorageValue(key: string, fallback = "") {
  return window.localStorage.getItem(key) || fallback;
}

export function ChatDemoPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: createId(), role: "assistant", content: "你好，我是 DemoKit 的流式助手。可以先用 Mock 模式体验，也可以在本地临时配置 OpenAI 兼容 API Key。" }
  ]);
  const [input, setInput] = useState("如何把这个 Demo 部署到 Vercel？");
  const [model, setModel] = useState("mock-assistant");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [apiKey, setApiKey] = useState(() => localStorageValue(API_KEY_STORAGE_KEY));
  const [baseUrl, setBaseUrl] = useState(() => localStorageValue(BASE_URL_STORAGE_KEY, "https://api.openai.com/v1"));
  const [apiKeyDraft, setApiKeyDraft] = useState(apiKey);
  const [baseUrlDraft, setBaseUrlDraft] = useState(baseUrl);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedModel = useMemo(() => modelOptions.find((option) => option.value === model)?.label || model, [model]);
  const hasApiKey = apiKey.trim().length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: loading ? "auto" : "smooth" });
  }, [messages, loading]);

  function saveConfig() {
    const nextApiKey = apiKeyDraft.trim();
    const nextBaseUrl = baseUrlDraft.trim() || "https://api.openai.com/v1";
    setApiKey(nextApiKey);
    setBaseUrl(nextBaseUrl);
    window.localStorage.setItem(API_KEY_STORAGE_KEY, nextApiKey);
    window.localStorage.setItem(BASE_URL_STORAGE_KEY, nextBaseUrl);
    setShowConfig(false);
  }

  function clearConfig() {
    setApiKey("");
    setApiKeyDraft("");
    window.localStorage.removeItem(API_KEY_STORAGE_KEY);
  }

  function handleFiles(files: FileList | null) {
    const imageFiles = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) return;
    setAttachments((current) => [
      ...current,
      ...imageFiles.map((file) => ({
        id: createId(),
        name: file.name,
        type: file.type,
        size: file.size,
        previewUrl: URL.createObjectURL(file)
      }))
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((current) => {
      const target = current.find((file) => file.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((file) => file.id !== id);
    });
  }

  function clearChat() {
    for (const file of attachments) {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    }
    for (const message of messages) {
      for (const file of message.attachments || []) {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      }
    }
    setMessages([]);
    setAttachments([]);
  }

  async function readStream(response: Response, assistantId: string) {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("STREAM_NOT_SUPPORTED");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        const dataLine = event.split("\n").find((line) => line.startsWith("data:"));
        if (!dataLine) continue;
        const payload = dataLine.replace(/^data:\s*/, "");
        const data = JSON.parse(payload) as { type?: string; content?: string };
        if (data.type === "delta" && data.content) {
          setMessages((current) => current.map((message) => (message.id === assistantId ? { ...message, content: message.content + data.content } : message)));
        }
      }
    }
  }

  async function send() {
    const text = input.trim();
    if (!text && !attachments.length) return;

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: text || "已上传图片附件，请结合附件说明。",
      attachments
    };
    const assistantId = createId();
    const next = [...messages, userMessage, { id: assistantId, role: "assistant" as const, content: "" }];

    setMessages(next);
    setInput("");
    setAttachments([]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model,
          apiKey: hasApiKey ? apiKey : undefined,
          baseUrl,
          messages: next.filter((message) => message.role !== "assistant" || message.content).map((message) => ({ role: message.role, content: message.content })),
          attachments: userMessage.attachments?.map((file) => ({ name: file.name, type: file.type, size: file.size }))
        })
      });

      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      await readStream(response, assistantId);
    } catch {
      setMessages((current) => current.map((message) => (message.id === assistantId ? { ...message, content: "请求没有完成，请稍后重试；Mock 流式接口也可能尚未启动。" } : message)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell title="Chat Demo" badge="Streaming Chat" description="对话型 AI 应用骨架。支持图片附件状态、模型切换、本地临时 API Key 配置和可工作的流式响应。" compact>
      <div className="mx-auto flex h-full min-h-0 max-w-5xl flex-col">
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 px-4 py-3 text-sm text-slate-400 sm:px-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-emerald-100">
              <Sparkles size={15} /> {selectedModel} · {hasApiKey ? "API Key 已启用" : "Mock 流式"}
            </div>
            <button className="transition hover:text-white" onClick={clearChat}>清空对话</button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
            <div className="space-y-4 pb-3">
              {messages.map((message) => (
                <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[88%] sm:max-w-[82%]" : "max-w-[88%] sm:max-w-[82%]"}>
                  <div className={message.role === "user" ? "rounded-3xl bg-emerald-300 p-4 text-slate-950 shadow-lg shadow-emerald-950/20" : "rounded-3xl border border-slate-700/70 bg-slate-900/80 p-4 text-slate-100"}>
                    {message.content ? <pre className="m-0 whitespace-pre-wrap font-sans leading-7">{message.content}</pre> : <span className="inline-flex items-center gap-2 text-slate-400"><LoaderCircle className="animate-spin" size={16} /> 正在生成...</span>}
                    {message.attachments?.length ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {message.attachments.map((file) => (
                          <div key={file.id} className="flex items-center gap-3 rounded-2xl bg-slate-950/15 p-2 text-xs">
                            {file.previewUrl ? <img src={file.previewUrl} alt={file.name} className="h-12 w-12 rounded-xl object-cover" /> : null}
                            <div className="min-w-0">
                              <div className="truncate font-semibold">{file.name}</div>
                              <div className="opacity-70">{formatFileSize(file.size)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-700/60 bg-slate-950/70 p-3 shadow-[0_-20px_60px_rgba(2,6,23,0.35)] sm:p-4">
            <div className="max-h-[42svh] overflow-y-auto rounded-[1.75rem] bg-slate-900/55 p-3 transition focus-within:bg-slate-900/75 sm:p-4">
              {attachments.length ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-2 py-2 text-xs text-slate-200">
                      {file.previewUrl ? <img src={file.previewUrl} alt={file.name} className="h-10 w-10 rounded-xl object-cover" /> : null}
                      <span className="max-w-40 truncate">{file.name}</span>
                      <span className="text-slate-500">{formatFileSize(file.size)}</span>
                      <button className="rounded-full p-1 text-slate-500 transition hover:bg-slate-800 hover:text-white" onClick={() => removeAttachment(file.id)} aria-label={`移除 ${file.name}`}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <Textarea
                className="h-24 min-h-24 max-h-36 resize-none overflow-y-auto border-0 bg-transparent px-2 py-2 text-base leading-7 focus:border-transparent"
                placeholder="Ask anything or type @ to add context"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input ref={fileInputRef} className="hidden" type="file" accept="image/*" multiple onChange={(event) => handleFiles(event.target.files)} />
                  <button className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-700 px-3 text-sm text-slate-300 transition hover:border-emerald-300/60 hover:text-white" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus size={16} /> 上传图片
                  </button>
                  <select className="h-10 rounded-2xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none transition hover:border-emerald-300/60" value={model} onChange={(event) => setModel(event.target.value)}>
                    {modelOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <button className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-700 px-3 text-sm text-slate-300 transition hover:border-emerald-300/60 hover:text-white" onClick={() => setShowConfig((value) => !value)}>
                    <KeyRound size={16} /> {hasApiKey ? "API Key 已配置" : "配置 API Key"}
                  </button>
                </div>

                <Button className="h-11 w-11 rounded-2xl px-0" disabled={loading || (!input.trim() && !attachments.length)} onClick={send} aria-label="发送消息">
                  {loading ? <LoaderCircle className="animate-spin" size={18} /> : <SendHorizonal size={18} />}
                </Button>
              </div>

              {showConfig ? (
                <div className="mt-4 rounded-3xl border border-slate-700 bg-slate-950/75 p-4">
                  <div className="mb-3 text-sm font-semibold text-white">本地调试 API 配置</div>
                  <p className="mb-4 text-xs leading-6 text-slate-400">API Key 仅保存到当前浏览器 localStorage；请求时只用于本次服务端转发，不会写入代码或构建变量。图片附件目前不会上传给第三方模型。</p>
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-300/70" type="password" placeholder="sk-..." value={apiKeyDraft} onChange={(event) => setApiKeyDraft(event.target.value)} />
                    <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-300/70" placeholder="https://api.openai.com/v1" value={baseUrlDraft} onChange={(event) => setBaseUrlDraft(event.target.value)} />
                    <div className="flex gap-2">
                      <Button onClick={saveConfig}>保存</Button>
                      <button className="rounded-full border border-slate-700 px-4 text-sm text-slate-300 transition hover:text-white" onClick={clearConfig}>清除</button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="px-3 pt-3 text-xs leading-6 text-slate-500">提示：`Shift + Enter` 换行，`Enter` 发送。未配置 API Key 时自动使用 Mock streaming。</div>
          </div>
        </Card>
      </div>
    </DemoShell>
  );
}
