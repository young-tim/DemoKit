import { Link } from "react-router-dom";
import { ArrowUpRight, Rocket, ShieldCheck, TerminalSquare } from "lucide-react";
import { EnvStatus } from "../components/demo/EnvStatus";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { demoCards } from "../config/demo.config";
import { appEnv } from "../lib/env";

export function HomePage() {
  return (
    <main className="relative min-h-screen px-5 py-8 sm:px-8">
      <div className="grid-bg" />
      <section className="relative mx-auto max-w-7xl">
        <nav className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-300 text-lg font-black text-slate-950">D</div>
            <div>
              <div className="font-bold text-white">DemoKit</div>
              <div className="text-xs text-slate-500">template starter</div>
            </div>
          </div>
          {/* <div className="flex flex-wrap gap-2">
            <EnvStatus />
            <Badge>Vite + React + Hono</Badge>
          </div> */}
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <Badge>轻量、可复制、可部署</Badge>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl">{appEnv.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-300">{appEnv.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5" to="/api-debug">验证 API</Link>
              {appEnv.githubUrl ? <a className="rounded-full border border-slate-500/30 px-5 py-3 text-sm text-slate-200" href={appEnv.githubUrl}>GitHub</a> : null}
            </div>
          </div>

          <Card className="relative overflow-hidden">
            <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-emerald-300/20 blur-2xl" />
            <div className="relative space-y-5">
              <div className="flex gap-3"><TerminalSquare className="text-emerald-200" /><span>pnpm install && pnpm dev</span></div>
              <div className="flex gap-3"><Rocket className="text-blue-200" /><span>Docker / Vercel / Netlify / Cloudflare</span></div>
              <div className="flex gap-3"><ShieldCheck className="text-amber-200" /><span>环境变量代理与轻量访问密码</span></div>
            </div>
          </Card>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {demoCards.map((card) => (
            <Link key={card.href} to={card.href}>
              <Card className="h-full transition hover:-translate-y-1 hover:border-emerald-300/50">
                <div className="mb-8 flex justify-end text-slate-500"><ArrowUpRight /></div>
                <h2 className="text-xl font-bold text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">{card.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
