import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "../ui/Badge";

type DemoShellProps = {
  title: string;
  description: string;
  badge?: string;
  children: ReactNode;
};

export function DemoShell({ title, description, badge, children }: DemoShellProps) {
  return (
    <main className="relative min-h-screen px-5 py-8 sm:px-8">
      <div className="grid-bg" />
      <div className="relative mx-auto max-w-7xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
          <ArrowLeft size={16} /> 返回首页
        </Link>
        <header className="mb-8 max-w-3xl">
          {badge ? <Badge>{badge}</Badge> : null}
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">{title}</h1>
          <p className="mt-4 text-base leading-8 text-slate-300">{description}</p>
        </header>
        {children}
      </div>
    </main>
  );
}
