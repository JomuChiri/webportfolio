import { stitch } from "@google/stitch-sdk";

if (!process.env.STITCH_API_KEY) {
  console.error("STITCH_API_KEY is required.");
  process.exit(1);
}

const result = await stitch.listTools();
console.log(`stitch_tools=${result.tools.length}`);
