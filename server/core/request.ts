export interface CoreRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: unknown;
  rawBody?: string;
}

export interface CoreResponse {
  status: number;
  headers?: Record<string, string>;
  body: unknown;
}
