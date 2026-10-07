import { defineConfig } from "@nuxtjs/mdc/config";
import { transformerNotationWordHighlight } from "@shikijs/transformers";

export default defineConfig({
  shiki: {
    transformers: [
      transformerNotationWordHighlight(),
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
