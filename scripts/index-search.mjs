import { cp, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
execFileSync("pnpm", ["exec", "pagefind", "--site", ".output/public"], { stdio: "inherit" });
await mkdir("public/pagefind", { recursive: true });
await cp(".output/public/pagefind", "public/pagefind", { recursive: true });
