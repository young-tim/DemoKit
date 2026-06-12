import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, SendHorizonal, Settings2, Sparkles, Trash2, X } from "lucide-react";
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
const MODEL_STORAGE_KEY = "demokit.chat.model";
const CUSTOM_MODELS_STORAGE_KEY = "demokit.chat.customModels";
const DEFAULT_MODEL = "mock-assistant";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const MAX_CUSTOM_MODELS = 8;

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

function readCustomModels() {
  try {
    const parsed = JSON.parse(localStorageValue(CUSTOM_MODELS_STORAGE_KEY, "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean).slice(0, MAX_CUSTOM_MODELS);
  } catch {
    return [];
  }
}

function isPresetModel(value: string) {
  return modelOptions.some((option) => option.value.toLowerCase() === value.toLowerCase());
}

function uniqueModels(values: string[]) {
  const seen = new Set<string>();
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function ChatDemoPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: createId(), role: "assistant", content: "你好，我是 DemoKit 的流式助手。可以先用 Mock 模式体验，也可以在本地临时配置 OpenAI 兼容 API Key。" }
  ]);
  const [input, setInput] = useState("如何把这个 Demo 部署到 Vercel？");
  const [model, setModel] = useState(() => localStorageValue(MODEL_STORAGE_KEY, DEFAULT_MODEL));
  const [customModels, setCustomModels] = useState(readCustomModels);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [apiKey, setApiKey] = useState(() => localStorageValue(API_KEY_STORAGE_KEY));
  const [baseUrl, setBaseUrl] = useState(() => localStorageValue(BASE_URL_STORAGE_KEY, DEFAULT_BASE_URL));
  const [apiKeyDraft, setApiKeyDraft] = useState(apiKey);
  const [baseUrlDraft, setBaseUrlDraft] = useState(baseUrl);
  const [customModelDraft, setCustomModelDraft] = useState("");
  const [modelNotice, setModelNotice] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);

  const normalizedModel = model.trim() || DEFAULT_MODEL;
  const selectedModel = useMemo(() => modelOptions.find((option) => option.value === normalizedModel)?.label || normalizedModel, [normalizedModel]);
  const hasApiKey = apiKey.trim().length > 0;
  const combinedModelOptions = useMemo(() => {
    const customOptions = customModels.map((value) => ({ value, label: value, custom: true }));
    const currentOption = !isPresetModel(normalizedModel) && !customModels.some((value) => value.toLowerCase() === normalizedModel.toLowerCase())
      ? [{ value: normalizedModel, label: normalizedModel, custom: true }]
      : [];
    return [...modelOptions.map((option) => ({ ...option, custom: false })), ...customOptions, ...currentOption];
  }, [customModels, normalizedModel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: loading ? "auto" : "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const nextModel = model.trim();
    if (nextModel) window.localStorage.setItem(MODEL_STORAGE_KEY, nextModel);
  }, [model]);

  function persistCustomModels(nextModels: string[]) {
    window.localStorage.setItem(CUSTOM_MODELS_STORAGE_KEY, JSON.stringify(nextModels));
  }

  function rememberCustomModel(value: string, options: { silent?: boolean } = {}) {
    const nextModel = value.trim();
    if (!nextModel || isPresetModel(nextModel)) return;

    setCustomModels((current) => {
      if (current.some((item) => item.toLowerCase() === nextModel.toLowerCase())) {
        if (!options.silent) setModelNotice("这个模型已经在自定义列表里。");
        return current;
      }

      const nextModels = uniqueModels([nextModel, ...current]).slice(0, MAX_CUSTOM_MODELS);
      persistCustomModels(nextModels);
      if (!options.silent) setModelNotice(`已添加 ${nextModel}`);
      return nextModels;
    });
  }

  function selectModel(value = model, options: { remember?: boolean } = {}) {
    const nextModel = value.trim() || DEFAULT_MODEL;
    setModel(nextModel);
    window.localStorage.setItem(MODEL_STORAGE_KEY, nextModel);
    if (options.remember) rememberCustomModel(nextModel, { silent: true });
    return nextModel;
  }

  function removeCustomModel(value: string) {
    setCustomModels((current) => {
      const nextModels = current.filter((item) => item !== value);
      persistCustomModels(nextModels);
      return nextModels;
    });
    if (normalizedModel.toLowerCase() === value.toLowerCase()) selectModel(DEFAULT_MODEL);
    setModelNotice(`已删除 ${value}`);
  }

  function addCustomModel() {
    const nextModel = customModelDraft.trim();
    if (!nextModel) {
      setModelNotice("请输入模型名称。");
      return;
    }
    if (isPresetModel(nextModel)) {
      selectModel(nextModel);
      setCustomModelDraft("");
      setModelNotice("已选择内置模型。");
      return;
    }

    rememberCustomModel(nextModel);
    selectModel(nextModel);
    setCustomModelDraft("");
  }

  function saveConfig() {
    const nextApiKey = apiKeyDraft.trim();
    const nextBaseUrl = baseUrlDraft.trim() || DEFAULT_BASE_URL;
    setApiKey(nextApiKey);
    setBaseUrl(nextBaseUrl);
    window.localStorage.setItem(API_KEY_STORAGE_KEY, nextApiKey);
    window.localStorage.setItem(BASE_URL_STORAGE_KEY, nextBaseUrl);
    setShowConfig(false);
  }

  function clearConfig() {
    setApiKey("");
    setBaseUrl(DEFAULT_BASE_URL);
    setApiKeyDraft("");
    setBaseUrlDraft(DEFAULT_BASE_URL);
    window.localStorage.removeItem(API_KEY_STORAGE_KEY);
    window.localStorage.removeItem(BASE_URL_STORAGE_KEY);
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

    const appendDelta = async (content: string) => {
      if (!content) return;
      setMessages((current) => current.map((message) => (message.id === assistantId ? { ...message, content: message.content + content } : message)));
      // 当浏览器一次读到多条 SSE 时，主动让出一帧，避免 React 合并成一次性渲染。
      await new Promise<void>((resolve) => window.setTimeout(resolve, 16));
    };

    const handleEvent = async (event: string) => {
      const dataLines = event.split("\n").filter((line) => line.startsWith("data:"));
      for (const line of dataLines) {
        const payload = line.replace(/^data:\s*/, "").trim();
        if (!payload || payload === "[DONE]") continue;
        const data = JSON.parse(payload) as { type?: string; content?: string };
        if (data.type === "delta" && data.content) {
          await appendDelta(data.content);
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        await handleEvent(event);
      }
      if (done) break;
    }

    if (buffer.trim()) {
      await handleEvent(buffer);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text && !attachments.length) return;
    const requestModel = selectModel(model);

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
          model: requestModel,
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
                  <label className="flex h-10 min-w-48 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 transition hover:border-emerald-300/60 focus-within:border-emerald-300/70 sm:min-w-56">
                    <span className="shrink-0 text-slate-500">模型</span>
                    <select
                      className="min-w-0 flex-1 cursor-pointer bg-transparent text-slate-100 outline-none"
                      value={normalizedModel}
                      aria-label="对话模型名称"
                      onChange={(event) => selectModel(event.target.value)}
                    >
                      {combinedModelOptions.map((option) => (
                        <option key={`${option.custom ? "custom" : "preset"}-${option.value}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-700 px-3 text-sm text-slate-300 transition hover:border-emerald-300/60 hover:text-white"
                    onClick={() => {
                      setApiKeyDraft(apiKey);
                      setBaseUrlDraft(baseUrl);
                      setModelNotice("");
                      setShowConfig(true);
                    }}
                  >
                    <Settings2 size={16} /> 配置
                  </button>
                </div>

                <Button className="h-11 w-11 rounded-2xl px-0" disabled={loading || (!input.trim() && !attachments.length)} onClick={send} aria-label="发送消息">
                  {loading ? <LoaderCircle className="animate-spin" size={18} /> : <SendHorizonal size={18} />}
                </Button>
              </div>

            </div>
            <div className="px-3 pt-3 text-xs leading-6 text-slate-500">提示：`Shift + Enter` 换行，`Enter` 发送。未配置 API Key 时自动使用 Mock streaming。</div>
          </div>
        </Card>
      </div>

      {showConfig ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 px-3 py-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="chat-config-title" onMouseDown={() => setShowConfig(false)}>
          <div className="max-h-[88svh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-slate-700 bg-slate-950 p-4 shadow-2xl shadow-slate-950/70 sm:p-6" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div id="chat-config-title" className="text-lg font-semibold text-white">Chat 配置</div>
                <p className="mt-1 text-sm leading-6 text-slate-400">API Key、Base URL 和模型列表只保存在当前浏览器 localStorage，适合本地调试，不会写入代码仓库。</p>
              </div>
              <button className="rounded-full border border-slate-700 p-2 text-slate-400 transition hover:border-emerald-300/60 hover:text-white" onClick={() => setShowConfig(false)} aria-label="关闭配置弹窗">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/45 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-100">本地 API 配置</div>
                    <div className="mt-1 text-xs text-slate-500">{hasApiKey ? "发送时会随请求传给服务端代理。" : "未配置时自动使用 Mock streaming fallback。"}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${hasApiKey ? "bg-emerald-300/15 text-emerald-100" : "bg-slate-800 text-slate-400"}`}>
                    {hasApiKey ? "已启用" : "Mock 模式"}
                  </span>
                </div>
                <div className="grid gap-3">
                  <label className="grid gap-2 text-sm text-slate-300">
                    <span>API Key</span>
                    <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/70" type="password" placeholder="sk-..." value={apiKeyDraft} onChange={(event) => setApiKeyDraft(event.target.value)} />
                  </label>
                  <label className="grid gap-2 text-sm text-slate-300">
                    <span>Base URL</span>
                    <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/70" placeholder={DEFAULT_BASE_URL} value={baseUrlDraft} onChange={(event) => setBaseUrlDraft(event.target.value)} />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={saveConfig}>保存配置</Button>
                  <button className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-rose-300/60 hover:text-white" onClick={clearConfig}>清空配置</button>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/45 p-4">
                <div className="mb-4">
                  <div className="font-semibold text-slate-100">模型维护</div>
                  <div className="mt-1 text-xs text-slate-500">主界面下拉会同步展示内置模型和这里新增的自定义模型。</div>
                </div>

                <label className="grid gap-2 text-sm text-slate-300">
                  <span>当前模型</span>
                  <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-300/70" value={normalizedModel} onChange={(event) => selectModel(event.target.value)}>
                    {combinedModelOptions.map((option) => (
                      <option key={`modal-${option.custom ? "custom" : "preset"}-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/70"
                    placeholder="输入自定义模型，如 gpt-4.1 或 qwen-max"
                    value={customModelDraft}
                    onChange={(event) => {
                      setCustomModelDraft(event.target.value);
                      setModelNotice("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomModel();
                      }
                    }}
                  />
                  <Button onClick={addCustomModel}>新增并选择</Button>
                </div>
                {modelNotice ? <div className="mt-2 text-xs text-slate-400">{modelNotice}</div> : null}

                <div className="mt-5">
                  <div className="mb-2 text-xs font-semibold text-slate-500">内置常用模型</div>
                  <div className="flex flex-wrap gap-2">
                    {modelOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${normalizedModel === option.value ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-slate-700 bg-slate-950 text-slate-300 hover:border-emerald-300/60 hover:text-white"}`}
                        onClick={() => selectModel(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 text-xs font-semibold text-slate-500">自定义模型</div>
                  {customModels.length ? (
                    <div className="grid gap-2">
                      {customModels.map((option) => (
                        <div key={option} className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-sm ${normalizedModel === option ? "border-cyan-300 bg-cyan-300/10 text-cyan-50" : "border-slate-700 bg-slate-950 text-slate-300"}`}>
                          <button className="min-w-0 flex-1 truncate text-left transition hover:text-white" onClick={() => selectModel(option)}>
                            {option}
                          </button>
                          <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-800 hover:text-rose-200" onClick={() => removeCustomModel(option)} aria-label={`删除自定义模型 ${option}`}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-5 text-center text-sm text-slate-500">还没有自定义模型。</div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </DemoShell>
  );
}
