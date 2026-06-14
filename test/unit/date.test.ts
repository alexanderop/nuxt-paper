import { describe, expect, it } from "vitest";
import { type DatedEntry, resolvePostDate } from "~/utils/date";

function makeEntry(overrides: Partial<DatedEntry> = {}): DatedEntry {
  return {
    pubDatetime: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("resolvePostDate", () => {
  it("uses modDatetime and flags isModified when it is later than pub", () => {
    const { datetime, isModified } = resolvePostDate(
      makeEntry({
        pubDatetime: "2024-01-01T00:00:00Z",
        modDatetime: "2024-06-01T00:00:00Z",
      })
    );
    expect(isModified).toBe(true);
    expect(datetime.toISOString()).toBe("2024-06-01T00:00:00.000Z");
  });

  it("falls back to pubDatetime when there is no modDatetime", () => {
    const { datetime, isModified } = resolvePostDate(
      makeEntry({ pubDatetime: "2024-01-01T00:00:00Z" })
    );
    expect(isModified).toBe(false);
    expect(datetime.toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });

  it("uses pubDatetime when modDatetime is earlier", () => {
    const { datetime, isModified } = resolvePostDate(
      makeEntry({
        pubDatetime: "2024-06-01T00:00:00Z",
        modDatetime: "2024-01-01T00:00:00Z",
      })
    );
    expect(isModified).toBe(false);
    expect(datetime.toISOString()).toBe("2024-06-01T00:00:00.000Z");
  });

  it("respects an explicit timezone", () => {
    // UTC midnight in Tokyo (UTC+9) renders as 09:00 local time.
    const { datetime } = resolvePostDate(
      makeEntry({ pubDatetime: "2024-01-01T00:00:00Z", timezone: "Asia/Tokyo" })
    );
    expect(datetime.format("YYYY-MM-DD HH:mm")).toBe("2024-01-01 09:00");
  });

  it("falls back to the site timezone when none is given", () => {
    // SITE.timezone is Asia/Bangkok (UTC+7): UTC midnight renders as 07:00.
    const { datetime } = resolvePostDate(
      makeEntry({ pubDatetime: "2024-01-01T00:00:00Z" })
    );
    expect(datetime.format("YYYY-MM-DD HH:mm")).toBe("2024-01-01 07:00");
  });
});
