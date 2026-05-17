import { existsSync, readFileSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const staticTargets = [".next/static"];
const serverTargets = [".open-next", ".next/server"];
const forbiddenValues = [
  process.env.SUPABASE_SERVICE_ROLE_KEY,
].filter(Boolean);
const suspiciousPatterns = [
  /sb_secret_[a-z0-9._-]+/gi,
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

async function main() {
  const hits = [];

  for (const target of [...staticTargets, ...serverTargets]) {
    if (!existsSync(target)) {
      continue;
    }

    const files = await walk(target);

    for (const file of files) {
      const stats = statSync(file);
      if (stats.size > 2 * 1024 * 1024) {
        continue;
      }

      const content = readFileSync(file, "utf8");
      for (const secretValue of forbiddenValues) {
        if (secretValue && content.includes(secretValue)) {
          hits.push({ file, marker: "<env-secret-value>" });
        }
      }

      for (const pattern of suspiciousPatterns) {
        const matches = content.match(pattern);
        if (matches?.length) {
          hits.push({ file, marker: "<suspicious-secret-pattern>" });
        }
      }
    }
  }

  if (hits.length) {
    console.error("secret_leak_detected");
    for (const hit of hits) {
      console.error(`${hit.file} -> ${hit.marker}`);
    }
    process.exit(1);
  }

  console.log("secret_leak_scan_passed");
}

void main();
