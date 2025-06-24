/**
 * main module tests
 *
 * Tests for main module exports
 */
import { describe, expect, it } from "vitest";

describe("main module exports", () => {
  it("should export functionalCustomElement", async () => {
    const mainModule = await import("../src/main") as any;
    expect("functionalCustomElement" in mainModule).toBe(true);
    expect(typeof mainModule.functionalCustomElement).toBe("function");
  });

  it("should export style functions", async () => {
    const mainModule = await import("../src/main") as any;
    expect("applyStyles" in mainModule).toBe(true);
    expect(typeof mainModule.applyStyles).toBe("function");
  });

  it("should export functionalDeclarativeCustomElement", async () => {
    const mainModule = await import("../src/main") as any;
    expect("functionalDeclarativeCustomElement" in mainModule).toBe(true);
    expect(typeof mainModule.functionalDeclarativeCustomElement).toBe("function");
  });

  it("should export all expected functions", async () => {
    const mainModule = await import("../src/main") as any;

    // Check that main exports include key functions
    expect("functionalCustomElement" in mainModule).toBe(true);
    expect("applyStyles" in mainModule).toBe(true);
    expect("functionalDeclarativeCustomElement" in mainModule).toBe(true);
  });

  it("should allow direct imports", async () => {
    // Test that we can import directly from main
    const { functionalCustomElement } = await import("../src/functionalCustomElement");
    const { applyStyles } = await import("../src/functionalCustomElement/style");
    const { functionalDeclarativeCustomElement } = await import("../src/functionalDeclarativeCustomElement");

    expect(typeof functionalCustomElement).toBe("function");
    expect(typeof applyStyles).toBe("function");
    expect(typeof functionalDeclarativeCustomElement).toBe("function");
  });
});
