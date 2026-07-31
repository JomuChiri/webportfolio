import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";
import type { ContentSection } from "@/lib/site";
import { contentMetaSchema, type ContentMeta } from "@/lib/schemas";
import { mdxComponents } from "@/components/mdx-components";

const contentRoot = path.join(process.cwd(), "content");

function sectionDir(section: ContentSection) {
  return path.join(contentRoot, section);
}

function filePathFor(section: ContentSection, slug: string) {
  return path.join(sectionDir(section), `${slug}.mdx`);
}

function countWords(source: string) {
  return source.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeMeta(section: ContentSection, slug: string, data: unknown, body: string): ContentMeta {
  const parsed = contentMetaSchema.parse(data);
  return {
    ...parsed,
    slug,
    section,
    href: `/${section}/${slug}`,
    readingMinutes: Math.max(1, Math.ceil(countWords(body) / 220))
  };
}

export function getSectionSlugs(section: ContentSection) {
  const dir = sectionDir(section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getAllContent(section: ContentSection): ContentMeta[] {
  return getSectionSlugs(section)
    .map((slug) => {
      const source = fs.readFileSync(filePathFor(section, slug), "utf8");
      const { data, content } = matter(source);
      return normalizeMeta(section, slug, data, content);
    })
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return b.date.getTime() - a.date.getTime();
    });
}

export function getAllCollections() {
  const sections: ContentSection[] = [
    "projects",
    "labs",
    "investigations",
    "knowledge",
    "writeups",
    "blog",
    "certifications"
  ];
  return sections.flatMap((section) => getAllContent(section));
}

export function getFeaturedContent(limit = 6) {
  return getAllCollections()
    .filter((item) => item.featured)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

export async function getCompiledContent(section: ContentSection, slug: string) {
  const source = fs.readFileSync(filePathFor(section, slug), "utf8");
  const { data, content } = matter(source);
  const meta = normalizeMeta(section, slug, data, content);
  const compiled = await compileMDX({
    source: content,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [[rehypePrism, { ignoreMissing: true }]]
      }
    }
  });
  return { meta, content: compiled.content };
}

export function getAllTags() {
  return Array.from(new Set(getAllCollections().flatMap((item) => item.tags))).sort();
}
