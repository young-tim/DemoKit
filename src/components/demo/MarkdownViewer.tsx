export function MarkdownViewer({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-3 text-sm leading-7 text-slate-200">
      {lines.map((line, index) => {
        if (line.startsWith("# ")) return <h2 key={index} className="text-2xl font-bold text-white">{line.slice(2)}</h2>;
        if (line.startsWith("## ")) return <h3 key={index} className="text-lg font-semibold text-emerald-100">{line.slice(3)}</h3>;
        if (line.startsWith("- ")) return <p key={index} className="pl-4 text-slate-300">• {line.slice(2)}</p>;
        return <p key={index}>{line || " "}</p>;
      })}
    </div>
  );
}
