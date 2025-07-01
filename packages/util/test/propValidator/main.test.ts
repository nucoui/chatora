import { describe, expect, it } from "vitest";
import * as convertExports from "../../src/propValidator/main";

describe("convert/main exports", () => {
  it("should export toBoolean function", () => {
    expect(convertExports.toBoolean).toBeDefined();
    expect(typeof convertExports.toBoolean).toBe("function");
  });

  it("should export toNumber function", () => {
    expect(convertExports.toNumber).toBeDefined();
    expect(typeof convertExports.toNumber).toBe("function");
  });

  it("should export toString function", () => {
    expect(convertExports.toString).toBeDefined();
    expect(typeof convertExports.toString).toBe("function");
  });

  it("should have the correct number of exports", () => {
    expect(Object.keys(convertExports)).toHaveLength(4);
  });
});
