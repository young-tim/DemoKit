import { useEffect, useState } from "react";
import { demoFetch } from "../../lib/request";
import { Badge } from "../ui/Badge";

interface HealthResponse {
  ok: true;
  data: {
    runtime: string;
    timestamp: number;
  };
}

export function EnvStatus() {
  const [runtime, setRuntime] = useState("checking");

  useEffect(() => {
    demoFetch<HealthResponse>("/api/health")
      .then((res) => setRuntime(res.data.runtime))
      .catch(() => setRuntime("api-offline"));
  }, []);

  return <Badge className="border-emerald-300/30 text-emerald-100">runtime: {runtime}</Badge>;
}
