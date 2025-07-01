import { describe, expect, it } from "vitest";
import { toBoolean } from "../../src/propValidator/toBoolean";

describe("toBoolean", () => {
  it("should convert empty string to true", () => {
    expect(toBoolean("")).toBe(true);
  });

  it("should convert 'true' string to true", () => {
    expect(toBoolean("true")).toBe(true);
  });

  it("should convert 'false' string to false", () => {
    expect(toBoolean("false")).toBe(false);
  });

  it("should convert undefined to false", () => {
    expect(toBoolean(undefined)).toBe(false);
  });

  it("should return undefined for other string values", () => {
    expect(toBoolean("yes")).toBe(undefined);
    expect(toBoolean("no")).toBe(undefined);
    expect(toBoolean("1")).toBe(undefined);
    expect(toBoolean("0")).toBe(undefined);
    expect(toBoolean("random text")).toBe(undefined);
  });
});
