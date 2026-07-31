import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { getAllContent, getCompiledContent } from "@/lib/content";
import { sectionConfig, type ContentSection } from "@/lib/site";

export function generateStaticParams() {
  return Object.keys(sectionConfig).flatMap((section) =>
    getAllContent(section as ContentSection).map((item) => ({ section, slug: item.slug }))
  );
}

export async function generateMetadata({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  if (!(section in sectionConfig)) return {};
  const item = getAllContent(section as ContentSection).find((entry) => entry.slug === slug);
  return item ? { title: item.title, description: item.description } : {};
}

export default async function ContentPage({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  if (!(section in sectionConfig)) notFound();
  const { meta, content } = await getCompiledContent(section as ContentSection, slug);

  return (
    <article className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
      <div>
        <div className="glass rounded-3xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">{meta.category}</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">{meta.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{meta.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>{meta.status}</Badge>
            <Badge>{meta.difficulty}</Badge>
            {meta.tags.map((tag) => (
              <Badge key={tag} className="bg-white/6">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {meta.github ? (
              <ButtonLink href={meta.github} variant="secondary" target="_blank">
                GitHub
              </ButtonLink>
            ) : null}
            {meta.documentation ? (
              <ButtonLink href={meta.documentation} target="_blank">
                Documentation
              </ButtonLink>
            ) : null}
          </div>
        </div>
        <div className="prose prose-invert mt-8 max-w-none rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          {content}
        </div>
      </div>
      <aside className="h-fit rounded-2xl border border-white/10 bg-white/6 p-5 lg:sticky lg:top-24">
        <p className="font-semibold text-white">Page metadata</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Type</dt>
            <dd className="text-slate-200">{sectionConfig[section as ContentSection].singular}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Reading time</dt>
            <dd className="text-slate-200">{meta.readingMinutes} min</dd>
          </div>
          <div>
            <dt className="text-slate-500">Stack</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {meta.stack.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </dd>
          </div>
        </dl>
      </aside>
    </article>
  );
}

