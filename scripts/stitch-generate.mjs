import fs from "node:fs/promises";
import path from "node:path";
import { stitch } from "@google/stitch-sdk";

function argValue(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

function requireArg(name) {
  const v = argValue(name);
  if (!v) {
    throw new Error(`Missing required argument: ${name}`);
  }
  return v;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

async function fetchBytes(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  if (!process.env.STITCH_API_KEY) {
    throw new Error("STITCH_API_KEY is required.");
  }

  const promptFile = requireArg("--prompt-file");
  const outputDir = requireArg("--output-dir");
  const deviceType = argValue("--device-type") || "DESKTOP";
  let projectId = argValue("--project-id");

  const prompt = await fs.readFile(promptFile, "utf8");
  await ensureDir(outputDir);

  if (!projectId) {
    const created = await stitch.callTool("create_project", { title: "Web Portfolio Project" });
    const projectName = created?.name;
    const projectNameId = typeof projectName === "string" ? projectName.split("/").pop() : null;
    projectId = created?.projectId || created?.id || created?.project_id || projectNameId;
    if (!projectId) throw new Error("Could not determine projectId from create_project.");
  }

  const project = stitch.project(projectId);
  const screen = await project.generate(prompt, deviceType);
  let htmlUrl = await screen.getHtml();
  const imageUrl = await screen.getImage();

  let html = await fetchText(htmlUrl);
  let looksLikeHtml =
    /<\s*html[\s>]/i.test(html) ||
    /<!doctype\s+html/i.test(html) ||
    /<\s*body[\s>]/i.test(html);
  if (!looksLikeHtml) {
    // Force a fresh get_screen lookup in case cached generation payload has stale URLs.
    const refreshed = await project.getScreen(screen.screenId || screen.id);
    htmlUrl = await refreshed.getHtml();
    html = await fetchText(htmlUrl);
    looksLikeHtml =
      /<\s*html[\s>]/i.test(html) ||
      /<!doctype\s+html/i.test(html) ||
      /<\s*body[\s>]/i.test(html);
  }
  if (!looksLikeHtml) {
    const preview = String(html || "").slice(0, 180).replace(/\s+/g, " ");
    throw new Error(`Stitch returned non-HTML content. Stop immediately. preview="${preview}"`);
  }
  await fs.writeFile(path.join(outputDir, "index.html"), html, "utf8");

  try {
    const imgBytes = await fetchBytes(imageUrl);
    await fs.writeFile(path.join(outputDir, "stitch-screen.png"), imgBytes);
  } catch {
    // Screenshot is optional for pipeline continuity.
  }

  console.log(`projectId=${projectId}`);
  console.log(`screenId=${screen.screenId || screen.id}`);
  console.log(`outputDir=${outputDir}`);
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
