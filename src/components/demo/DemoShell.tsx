import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";

type DemoShellProps = {
  title: string;
  description: string;
  badge?: string;
  children: ReactNode;
  compact?: boolean;
};

export function DemoShell({ title, description, badge, children, compact = false }: DemoShellProps) {
  return (
    <main className={cn("relative min-h-screen px-5 py-8 sm:px-8", compact && "h-svh min-h-0 overflow-hidden py-4 sm:py-5")}>
      <div className="grid-bg" />
      <div className={cn("relative mx-auto max-w-7xl", compact && "flex h-full min-h-0 flex-col")}>
        <Link to="/" className={cn("mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white", compact && "mb-4 shrink-0")}>
          <ArrowLeft size={16} /> 返回首页
        </Link>
        <header className={cn("mb-8 max-w-3xl", compact && "mb-4 shrink-0")}>
          {badge ? <Badge>{badge}</Badge> : null}
          <h1 className={cn("mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl", compact && "mt-3 text-3xl sm:text-5xl")}>{title}</h1>
          <p className={cn("mt-4 text-base leading-8 text-slate-300", compact && "mt-2 text-sm leading-6 sm:text-base sm:leading-7")}>{description}</p>
        </header>
        {compact ? <div className="min-h-0 flex-1">{children}</div> : children}
      </div>
    </main>
  );
}
