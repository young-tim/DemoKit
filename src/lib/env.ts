export const appEnv = {
  title: import.meta.env.VITE_APP_TITLE || "DemoKit",
  description: import.meta.env.VITE_APP_DESCRIPTION || "Lightweight demo starter kit",
  demoMode: import.meta.env.VITE_DEMO_MODE !== "false",
  theme: import.meta.env.VITE_APP_THEME || "default",
  githubUrl: import.meta.env.VITE_GITHUB_URL || ""
};
