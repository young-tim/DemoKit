export function getRuntime() {
  if (process.env.DEMO_RUNTIME) return process.env.DEMO_RUNTIME;
  if (process.env.VERCEL) return "vercel";
  if (process.env.NETLIFY) return "netlify";
  if (process.env.CF_PAGES) return "cloudflare";
  if (process.env.NODE_ENV === "production") return "docker";
  return "local";
}

export function getEnv(name: string) {
  return process.env[name] || "";
}

export function getNumberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
