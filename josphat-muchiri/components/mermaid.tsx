"use client";

import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";

export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      themeVariables: {
        background: "#111827",
        primaryColor: "#172033",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#3B82F6",
        lineColor: "#93c5fd",
        secondaryColor: "#1F2937",
        tertiaryColor: "#0f172a"
      }
    });

    mermaid.render(`diagram-${id}`, chart).then((result) => setSvg(result.svg));
  }, [chart, id]);

  return (
    <div className="my-8 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}

