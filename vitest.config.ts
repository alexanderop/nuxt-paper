import { defineVitestProject } from "@nuxt/test-utils/config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["test/unit/**/*.test.ts"],
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
