import { notFound } from "next/navigation";
import { ContentCard } from "@/components/card";
import { getAllContent } from "@/lib/content";
import { sectionConfig, type ContentSection } from "@/lib/site";

export function generateStaticParams() {
  return Object.keys(sectionConfig).map((section) => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(section in sectionConfig)) notFound();
  const typedSection = section as ContentSection;
  const config = sectionConfig[typedSection];
  const items = getAllContent(typedSection);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">{config.singular} library</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">{config.label}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{config.description}</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ContentCard key={item.href} item={item} />
        ))}
      </div>
    </section>
  );
}

