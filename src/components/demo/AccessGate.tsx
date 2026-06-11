import { type ReactNode, useEffect, useState } from "react";
import { demoFetch } from "../../lib/request";
import { AccessPasswordForm } from "./AccessPasswordForm";

const STORAGE_KEY = "demokit_access_state";

type AccessState = {
  granted: boolean;
  expiresAt: number;
};

type StatusResponse = {
  ok: true;
  data: { enabled: boolean; expiresInHours: number };
};

type VerifyResponse = {
  ok: true;
  data: { expiresInHours: number };
};

function readAccessState(): AccessState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AccessState;
    return data.granted && data.expiresAt > Date.now() ? data : null;
  } catch {
    return null;
  }
}

export function AccessGate({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [granted, setGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    demoFetch<StatusResponse>("/api/access/status")
      .then((res) => {
        setEnabled(res.data.enabled);
        setGranted(!res.data.enabled || Boolean(readAccessState()));
      })
      .catch(() => {
        // API 不可用时不阻断页面，方便纯前端调试。
        setEnabled(false);
        setGranted(true);
      })
      .finally(() => setChecking(false));
  }, []);

  async function verify(password: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await demoFetch<VerifyResponse>("/api/access/verify", {
        method: "POST",
        body: { password }
      });
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ granted: true, expiresAt: Date.now() + res.data.expiresInHours * 60 * 60 * 1000 })
      );
      setGranted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "密码不正确");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <main className="grid min-h-screen place-items-center text-slate-300">正在检查访问状态...</main>;
  }

  if (enabled && !granted) {
    return <AccessPasswordForm loading={loading} error={error} onSubmit={verify} />;
  }

  return <>{children}</>;
}
