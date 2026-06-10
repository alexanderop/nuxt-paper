import { describe, expect, it } from "vitest";
import { tplStr } from "../../shared/utils/i18n";

describe("tplStr", () => {
  it("replaces a single placeholder", () => {
    expect(tplStr("Share this post on {{platform}}", { platform: "X" })).toBe(
      "Share this post on X"
    );
  });

  it("replaces multiple placeholders", () => {
    expect(tplStr("{{a}} and {{b}}", { a: "one", b: "two" })).toBe(
      "one and two"
    );
  });

  it("replaces missing params with an empty string", () => {
    expect(tplStr("Hello {{name}}!", {})).toBe("Hello !");
  });

  it("leaves strings without placeholders untouched", () => {
    expect(tplStr("No params here", { unused: "x" })).toBe("No params here");
  });
});
