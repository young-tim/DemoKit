import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("rounded-full border border-slate-500/30 bg-slate-900/70 px-3 py-1 text-xs text-slate-300", className)} {...props} />;
}
