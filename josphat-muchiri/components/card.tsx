import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import type { ContentMeta } from "@/lib/schemas";
import { Badge } from "@/components/badge";

export function ContentCard({ item }: { item: ContentMeta }) {
  return (
    <Link href={item.href} className="glass group block rounded-2xl p-5 transition hover:-translate-y-1 hover:border-blue-300/30">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">{item.category}</p>
          <h3 className="font-display text-2xl font-bold text-white">{item.title}</h3>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:text-blue-200" />
      </div>
      <p className="min-h-14 text-sm leading-6 text-slate-300">{item.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge>{item.status}</Badge>
        <Badge>{item.difficulty}</Badge>
        {item.stack.slice(0, 3).map((tag) => (
          <Badge key={tag} className="bg-white/6 text-slate-200">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {item.date.getFullYear()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" />
          {item.readingMinutes} min read
        </span>
      </div>
    </Link>
  );
}

