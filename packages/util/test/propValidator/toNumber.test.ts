import { describe, expect, it } from "vitest";
import { toNumber } from "../../src/propValidator/toNumber";

describe("toNumber", () => {
  it("should return undefined for undefined input", () => {
    expect(toNumber(undefined)).toBe(undefined);
  });

  it("should return undefined for empty string", () => {
    expect(toNumber("")).toBe(undefined);
  });

  it("should convert numeric strings to numbers", () => {
    expect(toNumber("123")).toBe(123);
    expect(toNumber("-123")).toBe(-123);
    expect(toNumber("0")).toBe(0);
    expect(toNumber("123.45")).toBe(123.45);
    expect(toNumber("-123.45")).toBe(-123.45);
  });

  it("should return undefined for non-numeric strings", () => {
    expect(toNumber("hello")).toBe(undefined);
    expect(toNumber("123abc")).toBe(undefined);
    expect(toNumber("abc123")).toBe(undefined);
  });

  it("should handle special numeric formats", () => {
    expect(toNumber("1e3")).toBe(1000);
    expect(toNumber("1.2e-3")).toBe(0.0012);
    expect(toNumber("0x10")).toBe(16);
  });
});
