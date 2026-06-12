export function getEnv(name: string) {
  return process.env[name] || "";
}

export function getNumberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
