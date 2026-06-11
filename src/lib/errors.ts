export interface AppError {
  code: string;
  message: string;
  detail?: unknown;
}

export function toAppError(error: unknown): AppError {
  if (typeof error === "object" && error && "message" in error) {
    const maybe = error as Partial<AppError>;
    return {
      code: maybe.code || "REQUEST_ERROR",
      message: String(maybe.message || "Request failed"),
      detail: maybe.detail
    };
  }

  return {
    code: "REQUEST_ERROR",
    message: typeof error === "string" ? error : "Request failed"
  };
}
