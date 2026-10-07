import { rm } from "node:fs/promises";
await rm("public/pagefind", { recursive: true, force: true });
