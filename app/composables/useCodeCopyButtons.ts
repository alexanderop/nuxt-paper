/**
 * Adds a "Copy" button to every code block inside `#article`.
 * DOM-based because the blocks come from rendered markdown, not Vue.
 */
export function useCodeCopyButtons() {
  onMounted(() => {
    const copyButtonLabel = "Copy";
    const codeBlocks = Array.from(
      document.querySelectorAll<HTMLPreElement>("#article pre")
    );

    for (const codeBlock of codeBlocks) {
      if (codeBlock.parentElement?.classList.contains("code-block-wrapper"))
        continue;

      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper";
      wrapper.style.position = "relative";

      const copyButton = document.createElement("button");
      copyButton.className =
        "copy-code absolute end-3 -top-3 rounded bg-muted border border-muted px-2 py-1 text-xs leading-4 text-foreground font-medium";
      copyButton.innerHTML = copyButtonLabel;
      codeBlock.setAttribute("tabindex", "0");
      codeBlock.appendChild(copyButton);

      codeBlock.parentNode?.insertBefore(wrapper, codeBlock);
      wrapper.appendChild(codeBlock);

      copyButton.addEventListener("click", async () => {
        const code = codeBlock.querySelector("code");
        await navigator.clipboard.writeText(code?.innerText ?? "");
        copyButton.innerText = "Copied";
        setTimeout(() => {
          copyButton.innerText = copyButtonLabel;
        }, 700);
      });
    }
  });
}
