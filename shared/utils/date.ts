/**
 * Nuxt Content generates `z.date()` frontmatter fields as
 * `string | { [k: string]: unknown }`, but at runtime they are ISO strings.
 */
export type ContentDatetime = string | number | Date | { [k: string]: unknown };

export function toDate(value: ContentDatetime): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date(String(value));
}
