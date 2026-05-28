import { execFileSync, execSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const isStagedMode = process.argv.includes("--staged");

const GARMIN_SCHEMAS = [
  "http://www.garmin.com/xmlschemas/GpxExtensions/v3",
  "http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd",
  "http://www.garmin.com/xmlschemas/TrackPointExtension/v1",
  "http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd",
];

function getTargetFiles(isStagedMode) {
  if (isStagedMode) {
    const output = execSync("git diff --cached --name-only --diff-filter=ACMR", { encoding: "utf8" });
    return output
      .split("\n")
      .map((line) => line.trim())
      .filter((file) => file.startsWith("gpx/") && file.endsWith(".gpx"));
  }

  return readdirSync("gpx")
    .filter((name) => name.endsWith(".gpx"))
    .map((name) => join("gpx", name));
}

export function cleanGpx(content) {
  let cleaned = content;

  cleaned = cleaned.replace(/\n?\s*<extensions>[\s\S]*?<\/extensions>\n?/g, "\n");
  cleaned = cleaned.replace(/\sxmlns:gpxtpx="[^"]*"/g, "");
  cleaned = cleaned.replace(/\sxmlns:gpxx="[^"]*"/g, "");

  for (const schema of GARMIN_SCHEMAS) {
    const escaped = schema.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(`\\s${escaped}`, "g"), "");
  }

  return cleaned;
}

function run() {
  const files = getTargetFiles(isStagedMode);
  const changedFiles = [];

  for (const file of files) {
    const original = readFileSync(file, "utf8");
    const cleaned = cleanGpx(original);

    if (cleaned !== original) {
      writeFileSync(file, cleaned, "utf8");
      changedFiles.push(file);
    }
  }

  if (isStagedMode && changedFiles.length > 0) {
    execFileSync("git", ["add", "--", ...changedFiles], { stdio: "inherit" });
  }

  if (changedFiles.length > 0) {
    console.log(`Cleaned ${changedFiles.length} GPX file(s)`);
  } else {
    console.log("No GPX cleanup changes needed");
  }
}

const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectExecution) {
  run();
}
