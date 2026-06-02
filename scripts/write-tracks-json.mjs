#!/usr/bin/env node

import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

const inputDir = getArgValue("--input-dir") ?? "gpx";
const outputFile = getArgValue("--output-file") ?? "tracks.json";

async function writeTracksJson() {
  const entries = await readdir(inputDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".gpx"))
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));

  const payload = {
    generatedAt: new Date().toISOString(),
    files,
  };

  const outputDir = path.dirname(outputFile);
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

writeTracksJson().catch((error) => {
  console.error(`Failed to generate tracks manifest: ${error.message}`);
  process.exitCode = 1;
});
