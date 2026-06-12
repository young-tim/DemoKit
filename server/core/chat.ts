import type { CoreRequest } from "./request";
import { jsonError, streamResponse } from "./response";

type ChatRole = "user" | "assistant" | "system";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatAttachment = {
  name: string;
  type?: string;
  size?: number;
};

type ChatStreamBody = {
  messages?: ChatMessage[];
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  attachments?: ChatAttachment[];
};

const encoder = new TextEncoder();
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const privateHostPattern = /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|0\.0\.0\.0)/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeBody(body: unknown): ChatStreamBody {
  if (!isRecord(body)) return {};
  const messages = Array.isArray(body.messages)
    ? body.messages
        .filter((message): message is ChatMessage => isRecord(message) && typeof message.content === "string" && ["user", "assistant", "system"].includes(String(message.role)))
        .map((message) => ({ role: message.role, content: message.content }))
    : [];
  const attachments = Array.isArray(body.attachments)
    ? body.attachments
        .filter((file): file is ChatAttachment => isRecord(file) && typeof file.name === "string")
        .map((file) => ({ name: file.name, type: typeof file.type === "string" ? file.type : undefined, size: typeof file.size === "number" ? file.size : undefined }))
    : [];

  return {
    messages,
    attachments,
    model: typeof body.model === "string" ? body.model : undefined,
    apiKey: typeof body.apiKey === "string" ? body.apiKey : undefined,
    baseUrl: typeof body.baseUrl === "string" ? body.baseUrl : undefined
  };
}

function sse(data: unknown) {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkText(text: string) {
  const chars = Array.from(text);
  const chunks: string[] = [];
  for (let index = 0; index < chars.length; index += 4) chunks.push(chars.slice(index, index + 4).join(""));
  return chunks;
}

function buildMockReply(body: ChatStreamBody) {
  const lastUserMessage = [...(body.messages || [])].reverse().find((message) => message.role === "user");
  const attachmentText = body.attachments?.length
    ? `\n\n我也收到了 ${body.attachments.length} 个图片附件：${body.attachments.map((file) => file.name).join("、")}。当前 Demo 只在前端保留附件状态，不会把图片上传到第三方模型。`
    : "";

  return `已收到你的消息：「${lastUserMessage?.content || "空消息"}」。当前选择模型是 ${body.model || "mock-assistant"}。这是 DemoKit 的 Mock 流式响应：你可以在这里接入 OpenAI 兼容接口；没有可用 Key 或上游失败时，页面仍会保持流式演示体验。${attachmentText}`;
}

function buildChatCompletionsUrl(baseUrl: string) {
  const url = new URL(baseUrl || DEFAULT_BASE_URL);
  if (!["http:", "https:"].includes(url.protocol) || privateHostPattern.test(url.hostname)) {
    throw new Error("INVALID_BASE_URL");
  }
  const normalized = url.pathname.endsWith("/") ? url : new URL(`${url.href}/`);
  return new URL("chat/completions", normalized).toString();
}

async function* streamOpenAiCompatible(body: ChatStreamBody) {
  const apiKey = body.apiKey?.trim();
  if (!apiKey) return;

  const upstream = await fetch(buildChatCompletionsUrl(body.baseUrl || DEFAULT_BASE_URL), {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: body.model || "gpt-4o-mini",
      messages: body.messages?.length ? body.messages : [{ role: "user", content: "请用一句话介绍 DemoKit。" }],
      stream: true
    })
  });

  if (!upstream.ok || !upstream.body) {
    throw new Error(`UPSTREAM_${upstream.status}`);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      const lines = event.split("\n").filter((line) => line.startsWith("data:"));
      for (const line of lines) {
        const payload = line.replace(/^data:\s*/, "").trim();
        if (!payload || payload === "[DONE]") return;
        const parsed = JSON.parse(payload);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) yield delta;
      }
    }
  }
}

async function writeMockStream(controller: ReadableStreamDefaultController<Uint8Array>, body: ChatStreamBody) {
  await writeTextStream(controller, buildMockReply(body));
}

async function writeTextStream(controller: ReadableStreamDefaultController<Uint8Array>, text: string) {
  for (const chunk of chunkText(text)) {
    controller.enqueue(sse({ type: "delta", content: chunk }));
    await sleep(24);
  }
}

export async function handleChatStream(req: CoreRequest) {
  if (req.method !== "POST") {
    return jsonError("METHOD_NOT_ALLOWED", "Method not allowed", 405);
  }

  const body = normalizeBody(req.body);
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(sse({ type: "meta", model: body.model || "mock-assistant", mode: body.apiKey ? "openai-compatible" : "mock" }));

      try {
        if (body.apiKey) {
          for await (const chunk of streamOpenAiCompatible(body)) {
            controller.enqueue(sse({ type: "delta", content: chunk }));
          }
          controller.enqueue(sse({ type: "done" }));
          controller.close();
          return;
        }
      } catch {
        await writeTextStream(controller, "上游模型暂时不可用，已切换为本地 Mock 流式响应。\n\n");
      }

      await writeMockStream(controller, body);
      controller.enqueue(sse({ type: "done" }));
      controller.close();
    }
  });

  return streamResponse(stream);
}
