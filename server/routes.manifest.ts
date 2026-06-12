export type ApiRoute = {
  name: string;
  path: string;
  handler: string;
  importPath: string;
  methods?: string[];
};

export const apiRoutes: ApiRoute[] = [
  { name: "health", path: "/api/health", handler: "handleHealth", importPath: "@/server/core/health", methods: ["GET"] },
  { name: "mock", path: "/api/mock/:path*", handler: "handleMock", importPath: "@/server/core/mock", methods: ["GET"] },
  { name: "chat-stream", path: "/api/chat/stream", handler: "handleChatStream", importPath: "@/server/core/chat", methods: ["POST"] },
  { name: "proxy", path: "/api/proxy/:path*", handler: "handleProxy", importPath: "@/server/core/proxy", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
  { name: "access-status", path: "/api/access/status", handler: "handleAccessStatus", importPath: "@/server/core/access", methods: ["GET"] },
  { name: "access-verify", path: "/api/access/verify", handler: "handleAccessVerify", importPath: "@/server/core/access", methods: ["POST"] }
];
