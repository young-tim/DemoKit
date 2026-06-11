import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

type Props = {
  loading: boolean;
  error?: string | null;
  onSubmit: (password: string) => void;
};

export function AccessPasswordForm({ loading, error, onSubmit }: Props) {
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(password);
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-5">
      <div className="grid-bg" />
      <Card className="relative w-full max-w-md">
        <div className="mb-5 inline-flex rounded-2xl bg-emerald-300/10 p-3 text-emerald-200">
          <LockKeyhole />
        </div>
        <h1 className="text-3xl font-black text-white">Demo 访问保护</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">当前 Demo 设置了轻量访问密码。密码仅在服务端环境变量中校验，不会进入前端构建产物。</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input type="password" value={password} placeholder="输入访问密码" onChange={(event) => setPassword(event.target.value)} />
          {error ? <p className="text-sm text-red-200">{error}</p> : null}
          <Button className="w-full" disabled={loading || !password}>{loading ? "校验中..." : "进入 Demo"}</Button>
        </form>
      </Card>
    </main>
  );
}
