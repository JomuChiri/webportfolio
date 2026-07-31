import type { ComponentProps, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { Mermaid } from "@/components/mermaid";
import { Badge } from "@/components/badge";

export function Callout({ type = "info", title, children }: { type?: "info" | "success" | "warning"; title?: string; children: ReactNode }) {
  const Icon = type === "success" ? CheckCircle2 : type === "warning" ? AlertTriangle : Info;
  return (
    <div className="my-6 rounded-2xl border border-blue-300/20 bg-blue-400/10 p-4 text-slate-100">
      <div className="mb-2 flex items-center gap-2 font-semibold text-white">
        <Icon className="h-5 w-5 text-blue-200" />
        {title ?? "Note"}
      </div>
      <div className="text-sm leading-6 text-slate-300">{children}</div>
    </div>
  );
}

export function MITREMatrix({ techniques }: { techniques: string[] }) {
  return (
    <div className="my-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <div className="mb-3 flex items-center gap-2 font-semibold text-white">
        <ShieldCheck className="h-5 w-5 text-blue-200" />
        MITRE ATT&CK Mapping
      </div>
      <div className="flex flex-wrap gap-2">
        {techniques.map((technique) => (
          <Badge key={technique}>{technique}</Badge>
        ))}
      </div>
    </div>
  );
}

export function EvidenceGrid({ items }: { items: string[] }) {
  return (
    <div className="my-6 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="rounded-xl border border-white/10 bg-white/6 p-4 text-sm text-slate-200">
          {item}
        </div>
      ))}
    </div>
  );
}

export const mdxComponents = {
  Mermaid,
  Callout,
  MITREMatrix,
  EvidenceGrid,
  Badge,
  a: (props: ComponentProps<"a">) => <a {...props} className="font-medium text-blue-200 underline-offset-4 hover:underline" />,
  table: (props: ComponentProps<"table">) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/10">
      <table {...props} className="w-full text-left text-sm" />
    </div>
  ),
  th: (props: ComponentProps<"th">) => <th {...props} className="border-b border-white/10 bg-white/8 px-4 py-3 text-white" />,
  td: (props: ComponentProps<"td">) => <td {...props} className="border-b border-white/8 px-4 py-3 text-slate-300" />
};

