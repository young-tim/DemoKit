import { CheckCircle2, CircleDashed } from "lucide-react";

type Step = {
  title: string;
  description: string;
  status?: "pending" | "done";
};

export function StepRunner({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step.title} className="glass-panel flex gap-4 rounded-3xl p-4">
          <div className="mt-1 text-emerald-200">{step.status === "done" ? <CheckCircle2 size={20} /> : <CircleDashed size={20} />}</div>
          <div>
            <div className="text-sm font-semibold text-white">{index + 1}. {step.title}</div>
            <p className="mt-1 text-sm text-slate-400">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
