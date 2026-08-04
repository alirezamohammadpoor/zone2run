// typescript-eslint only supports TypeScript <6.1, while the workspace compiler
// is the native TS 7 (used by `next build` typecheck). Bun's overrides are
// flat-only, so nested "typescript": "5.9.3" overrides never materialize.
// Instead: the `typescript5` alias dep (npm:typescript@5.9.3) gets symlinked
// under every @typescript-eslint package that require()s typescript at lint
// time. Delete this script once typescript-eslint supports TS 7.
import { existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ts5 = join(root, "node_modules", "typescript5");

if (!existsSync(ts5)) {
  console.error("patch-eslint-ts: node_modules/typescript5 missing — run bun install");
  process.exit(1);
}

const targets = [
  "@typescript-eslint/typescript-estree",
  "@typescript-eslint/parser",
  "@typescript-eslint/type-utils",
  "@typescript-eslint/utils",
  "@typescript-eslint/eslint-plugin",
  "ts-api-utils",
];

for (const pkg of targets) {
  const pkgDir = join(root, "node_modules", pkg);
  if (!existsSync(pkgDir)) continue;
  const nested = join(pkgDir, "node_modules");
  const dest = join(nested, "typescript");
  mkdirSync(nested, { recursive: true });
  rmSync(dest, { recursive: true, force: true });
  symlinkSync(relative(nested, ts5), dest, "dir");
  console.log(`patch-eslint-ts: ${pkg} → typescript 5.9.3`);
}
