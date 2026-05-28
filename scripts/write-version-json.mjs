import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

function getHeadTag() {
  try {
    const output = execSync("git tag --points-at HEAD", { encoding: "utf8" }).trim();
    if (!output) {
      return null;
    }

    const [firstTag] = output.split("\n");
    return firstTag || null;
  } catch {
    return null;
  }
}

const tag = getHeadTag();
const payload = JSON.stringify({ tag });

writeFileSync("version.json", `${payload}\n`, "utf8");
