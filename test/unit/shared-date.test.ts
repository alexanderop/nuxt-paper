import { describe, expect, it } from "vitest";
import { toDate } from "#shared/utils/date";

describe("toDate", () => {
  it("passes Date instances through unchanged", () => {
    const input = new Date("2024-01-01T00:00:00Z");
    expect(toDate(input)).toBe(input);
  });

  it("parses ISO strings", () => {
    expect(toDate("2024-01-01T00:00:00Z").toISOString()).toBe(
      "2024-01-01T00:00:00.000Z"
    );
  });

  it("parses numeric epoch milliseconds", () => {
    const ms = Date.UTC(2024, 0, 1);
    expect(toDate(ms).getTime()).toBe(ms);
  });

  it("falls back to String() for object values", () => {
    // Objects stringify to "[object Object]", which is not a valid date.
    expect(Number.isNaN(toDate({ foo: "bar" }).getTime())).toBe(true);
  });
});
