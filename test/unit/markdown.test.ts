import { expect, it } from "vitest";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import { createShikiHighlighter } from "@nuxtjs/mdc/runtime/highlighter/shiki";
import config from "../../app/mdc.config";

  function text(node: { type: string; value?: string; children?: unknown[] }): string {
    return node.type === "text" ? node.value ?? "" : (node.children ?? []).map(child => text(child as Parameters<typeof text>[0])).join("");
  }

it("preserves code line boundaries and blank lines through the real MDC compiler", async () => {
  const highlighter = createShikiHighlighter({ getMdcConfigs: async () => [config] });
  const result = await parseMarkdown("```text\nfirst\n\nlast\n```", {
    highlight: { highlighter, theme: "none" },
    configs: [config],
  });
  expect(text(result.body)).toBe("first\n\nlast\n");
});
