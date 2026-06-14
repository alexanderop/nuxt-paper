import { fileURLToPath } from "node:url";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["app/**", "shared/**"],
      exclude: [
        "app/components/icons/**",
        "app/components/OgImage/**",
        "app/app.vue",
        "app/error.vue",
        "app/plugins/**",
        "**/*.d.ts",
      ],
      // Thresholds present but not enforced yet; raised to 70/70 in Wave 3.
      thresholds: { lines: 0, functions: 0 },
    },
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["test/unit/**/*.test.ts"],
          setupFiles: ["./test/setup/unit-auto-imports.ts"],
        },
        resolve: {
          alias: {
            "~~": fileURLToPath(new URL(".", import.meta.url)),
            "#shared": fileURLToPath(new URL("./shared", import.meta.url)),
            "~": fileURLToPath(new URL("./app", import.meta.url)),
          },
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["test/nuxt/**/*.test.ts"],
          environmentOptions: {
            nuxt: {
              domEnvironment: "happy-dom",
              overrides: {
                ogImage: { enabled: false },
              },
            },
          },
        },
      }),
    ],
  },
});
