const serverOnly = ["OPENAI_API_KEY", "CUSTOM_API_KEY", "DEMO_ACCESS_PASSWORD"];
const leaked = serverOnly.filter((name) => name.startsWith("VITE_"));
if (leaked.length) {
  throw new Error(`Server-only env names must not start with VITE_: ${leaked.join(", ")}`);
}
console.log("Environment variable naming looks good.");
