import { describe, expect, it } from "vitest";
import { type CSSStyleObject, normalizeStyleForDOM } from "../src/methods/genSD/styleObject";

describe("normalizeStyleForDOM", () => {
  it("should convert basic style object to CSS string", () => {
    const styleObject: CSSStyleObject = {
      color: "red",
      backgroundColor: "blue",
      fontSize: "16px",
    };

    const result = normalizeStyleForDOM(styleObject);
    expect(result).toBe("color: red; background-color: blue; font-size: 16px;");
  });

  it("should handle camelCase to kebab-case conversion", () => {
    const styleObject: CSSStyleObject = {
      backgroundColor: "red",
      marginTop: "10px",
      borderBottomWidth: "2px",
      textAlign: "center",
    };

    const result = normalizeStyleForDOM(styleObject);
    expect(result).toBe("background-color: red; margin-top: 10px; border-bottom-width: 2px; text-align: center;");
  });

  it("should add px to numeric values for pixel properties", () => {
    const styleObject: CSSStyleObject = {
      width: 100,
      height: 200,
      margin: 15,
      padding: 10,
      fontSize: 16,
      borderWidth: 2,
    };

    const result = normalizeStyleForDOM(styleObject);
    expect(result).toBe("width: 100px; height: 200px; margin: 15px; padding: 10px; font-size: 16px; border-width: 2px;");
  });

  it("should not add px to numeric values for non-pixel properties", () => {
    const styleObject: CSSStyleObject = {
      zIndex: 999,
      opacity: 0.5,
      fontWeight: 600,
      flexGrow: 1,
    };

    const result = normalizeStyleForDOM(styleObject);
    expect(result).toBe("z-index: 999; opacity: 0.5; font-weight: 600; flex-grow: 1;");
  });

  it("should handle mixed string and numeric values", () => {
    const styleObject: CSSStyleObject = {
      width: 100, // numeric -> should add px
      height: "auto", // string -> should not add px
      zIndex: 999, // numeric -> should not add px (not a pixel property)
      backgroundColor: "red", // string -> should not add px
      margin: 20, // numeric -> should add px
    };

    const result = normalizeStyleForDOM(styleObject);
    expect(result).toBe("width: 100px; height: auto; z-index: 999; background-color: red; margin: 20px;");
  });

  it("should handle empty object", () => {
    const styleObject: CSSStyleObject = {};

    const result = normalizeStyleForDOM(styleObject);
    expect(result).toBe("");
  });

  it("should handle complex CSS properties", () => {
    const styleObject: CSSStyleObject = {
      borderRadius: 5,
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      transform: "translateX(10px)",
      transition: "all 0.3s ease",
    };

    const result = normalizeStyleForDOM(styleObject);
    expect(result).toBe("border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transform: translateX(10px); transition: all 0.3s ease;");
  });

  it("should handle CSS custom properties (CSS variables)", () => {
    const styleObject: CSSStyleObject = {
      "--primary-color": "blue",
      "--secondary-color": "red",
      "color": "var(--primary-color)",
    };

    const result = normalizeStyleForDOM(styleObject);
    expect(result).toBe("--primary-color: blue; --secondary-color: red; color: var(--primary-color);");
  });

  it("should handle string values as-is", () => {
    const result = normalizeStyleForDOM("color: red; font-size: 16px;");
    expect(result).toBe("color: red; font-size: 16px;");
  });

  it("should handle arrays of mixed styles", () => {
    const styles = [
      "color: red;",
      { backgroundColor: "blue", fontSize: 14 },
      "border: 1px solid black;",
    ];

    const result = normalizeStyleForDOM(styles);
    expect(result).toBe("color: red; background-color: blue; font-size: 14px; border: 1px solid black;");
  });
});
