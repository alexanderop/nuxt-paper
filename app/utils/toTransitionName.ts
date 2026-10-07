export function toTransitionName(value: string): string {
  const base = slugifyStr(value.replaceAll(".", "-"));
  const name = [...base].map(character => {
    const point = character.codePointAt(0)!;
    return point > 127 ? `u${point.toString(16).padStart(6, "0")}` : character;
  }).join("").replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return /^\d/.test(name) ? `p-${name}` : name || "post";
}
