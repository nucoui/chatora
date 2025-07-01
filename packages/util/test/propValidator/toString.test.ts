import { describe, expect, it } from "vitest";
import { toString } from "../../src/propValidator/toString";

describe("toString", () => {
  it("should return undefined for undefined input", () => {
    expect(toString(undefined)).toBe(undefined);
  });

  it("should return undefined for empty string", () => {
    expect(toString("")).toBe(undefined);
  });

  it("should convert non-empty strings to string value", () => {
    expect(toString("hello")).toBe("hello");
    expect(toString("123")).toBe("123");
    expect(toString(" ")).toBe(" ");
  });

  it("should handle special characters", () => {
    expect(toString("hello\nworld")).toBe("hello\nworld");
    expect(toString("special chars: !@#$%^&*()")).toBe("special chars: !@#$%^&*()");
  });
});
