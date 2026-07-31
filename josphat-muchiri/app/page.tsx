import Image from "next/image";
import { ArrowRight, BookOpen, Download, FileCode2, Github, Radar, ShieldCheck, TerminalSquare } from "lucide-react";
import { ContentCard } from "@/components/card";
import { ButtonLink } from "@/components/button";
import { Badge } from "@/components/badge";
import { getAllContent, getFeaturedContent } from "@/lib/content";
import { site } from "@/lib/site";

const stats = [
  ["8+", "Security Projects"],
  ["20+", "Lab Write-ups"],
  ["5+", "Security Technologies"],
  ["Growing", "Knowledge Base"]
];

const learning = ["University of the People", "Cisco CyberOps", "LetsDefend", "TryHackMe", "Microsoft Learn"];

export default function HomePage() {
  const featured = getFeaturedContent(6);
  const investigations = getAllContent("investigations").slice(0, 4);

  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <Badge className="mb-6 w-fit">Available for SOC, security, and Python automation roles</Badge>
          <h1 className="font-display text-5xl font-bold leading-tight text-white sm:text-6xl">
            Josphat Muchiri
          </h1>
          <p className="mt-5 text-xl font-semibold text-blue-200">
            Cybersecurity Analyst
          </p>
          <p className="mt-2 text-lg text-slate-300">SOC | Detection Engineering | Python Automation</p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Building practical cybersecurity solutions through real-world labs, automation, and security research.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/projects">
              View Projects
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/labs" variant="secondary">
              Explore Labs
            </ButtonLink>
            <ButtonLink href={site.resumePdf} variant="secondary">
              <Download className="h-4 w-4" />
              Download Resume
            </ButtonLink>
          </div>
        </div>
        <div className="glass relative overflow-hidden rounded-3xl p-4">
          <Image
            src={site.portrait}
            alt="Josphat Muchiri"
            width={900}
            height={1100}
            priority
            className="aspect-[4/5] w-full rounded-2xl object-cover"
          />
          <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-background/82 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500/20 text-blue-200">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-white">Build. Document. Investigate.</p>
                <p className="text-sm text-slate-400">Practical security evidence, not buzzwords.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map(([value, label]) => (
          <div key={label} className="glass rounded-2xl p-5">
            <p className="font-display text-3xl font-bold text-white">{value}</p>
            <p className="mt-1 text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Featured work</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">Projects, labs, and investigations</h2>
          </div>
          <ButtonLink href="/projects" variant="ghost">
            All projects
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((item) => (
            <ContentCard key={item.href} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="glass rounded-3xl p-6">
          <BookOpen className="h-8 w-8 text-blue-200" />
          <h2 className="mt-5 font-display text-3xl font-bold text-white">Current learning</h2>
          <p className="mt-3 text-slate-300">
            The platform is designed to grow as Josphat adds certifications, write-ups, lab notes, and technical documentation.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {learning.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Threat Detection", Radar],
            ["Python Automation", TerminalSquare],
            ["Documentation", FileCode2],
            ["GitHub Evidence", Github]
          ].map(([label, Icon]) => (
            <div key={label as string} className="rounded-2xl border border-white/10 bg-white/6 p-5">
              <Icon className="h-7 w-7 text-blue-200" />
              <p className="mt-4 font-semibold text-white">{label as string}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Structured content, reusable components, and discoverable MDX pages keep the site useful over time.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Latest investigations</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">SOC-style incident notes</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {investigations.map((item) => (
            <ContentCard key={item.href} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

