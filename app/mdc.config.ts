import { defineConfig } from "@nuxtjs/mdc/config";
import { transformerNotationWordHighlight } from "@shikijs/transformers";

export default defineConfig({
  shiki: {
    transformers: [
      transformerNotationWordHighlight(),
      {
        name: "paper:readable-colors",
        preprocess(_code, options) {
          options.colorReplacements = {
            ...options.colorReplacements,
            "#c2c3c5": "#59616e",
            "#637777": "#8b9b9b",
          };
        },
      },
      {
        name: "paper:code-lines",
        code(node) {
          node.children = node.children.map(child =>
            child.type === "text" && /^\n+$/.test(child.value)
              ? { type: "element", tagName: "span", properties: { emptyLinePlaceholder: true }, children: [child] }
              : child
          );
          for (const line of node.children) {
            if (line.type !== "element") continue;
            const token = line.children.at(-1);
            if (token?.type !== "element") continue;
            const text = token.children.at(-1);
            if (text?.type === "text") text.value = text.value.replace(/\n$/, "");
          }
        },
      },
    ],
  },
});
