/**
 * style function tests
 *
 * Tests for style application functionality
 */
import { beforeEach, describe, expect, it } from "vitest";
import { applyStyles } from "../src/methods/genSD/style";

describe("applyStyles", () => {
  let shadowRoot: ShadowRoot;

  beforeEach(() => {
    const host = document.createElement("div");
    shadowRoot = host.attachShadow({ mode: "open" });
  });

  it("should apply single style string", () => {
    const styleString = "color: red; background: blue;";
    applyStyles(shadowRoot, styleString);

    const styleElement = shadowRoot.querySelector("style");
    expect(styleElement).not.toBeNull();
    expect(styleElement?.textContent).toBe(styleString);
  });

  it("should apply array of styles", () => {
    const styles = ["color: red;", "background: blue;", "font-size: 14px;"];
    applyStyles(shadowRoot, styles);

    const styleElements = shadowRoot.querySelectorAll("style");
    expect(styleElements.length).toBe(1); // Should create one style element with combined content

    const combinedText = styles.join("\n");
    expect(styleElements[0].textContent).toBe(combinedText);
  });

  it("should handle empty string", () => {
    applyStyles(shadowRoot, "");

    const styleElement = shadowRoot.querySelector("style");
    expect(styleElement).not.toBeNull();
    expect(styleElement?.textContent).toBe("");
  });

  it("should handle empty array", () => {
    applyStyles(shadowRoot, []);

    const styleElements = shadowRoot.querySelectorAll("style");
    expect(styleElements.length).toBe(1); // Should create one style element with empty content
    expect(styleElements[0].textContent).toBe("");
  });

  it("should handle mixed content in array", () => {
    const styles = ["color: red;", "", "background: blue;"];
    applyStyles(shadowRoot, styles);

    const styleElements = shadowRoot.querySelectorAll("style");
    expect(styleElements.length).toBe(1); // Should create one style element with combined content
    const combinedText = styles.join("\n");
    expect(styleElements[0].textContent).toBe(combinedText);
  });

  it("should create style elements with correct attributes", () => {
    applyStyles(shadowRoot, "test: value;");

    const styleElement = shadowRoot.querySelector("style");
    expect(styleElement?.tagName).toBe("STYLE");
    expect(styleElement?.getAttribute("type")).toBeNull(); // HTML5 doesn't require type attribute
  });

  it("should append to existing content", () => {
    // Add some existing content
    shadowRoot.innerHTML = "<div>existing</div>";

    applyStyles(shadowRoot, "color: red;");

    expect(shadowRoot.children.length).toBe(2);
    expect(shadowRoot.querySelector("div")).not.toBeNull();
    expect(shadowRoot.querySelector("style")).not.toBeNull();
  });

  it("should handle complex CSS", () => {
    const complexCSS = `
      :host {
        display: block;
        --custom-property: value;
      }
      
      .class-name {
        color: red;
        background: linear-gradient(to right, #000, #fff);
      }
      
      @media (max-width: 768px) {
        .responsive {
          display: none;
        }
      }
    `;

    applyStyles(shadowRoot, complexCSS);

    const styleElement = shadowRoot.querySelector("style");
    expect(styleElement?.textContent).toBe(complexCSS);
  });

  it("should handle CSS with special characters", () => {
    const cssWithSpecialChars = `
      .class::before {
        content: "\\n\\t\\r";
      }
      
      .quotes {
        content: '"test"';
      }
      
      .unicode {
        content: "\\1F600"; /* 😀 */
      }
    `;

    applyStyles(shadowRoot, cssWithSpecialChars);

    const styleElement = shadowRoot.querySelector("style");
    expect(styleElement?.textContent).toBe(cssWithSpecialChars);
  });

  it("should handle multiple calls", () => {
    applyStyles(shadowRoot, "color: red;");
    applyStyles(shadowRoot, ["background: blue;", "font-size: 14px;"]);

    const styleElements = shadowRoot.querySelectorAll("style");
    expect(styleElements.length).toBe(1); // Should reuse existing style element
    const combinedText = ["background: blue;", "font-size: 14px;"].join("\n");
    expect(styleElements[0].textContent).toBe(combinedText); // Last call overwrites
  });

  it("should handle style objects", () => {
    const styleObject = {
      color: "red",
      backgroundColor: "blue",
      fontSize: "16px",
      marginTop: 10,
      padding: "5px 10px",
    };

    applyStyles(shadowRoot, styleObject);

    const styleElement = shadowRoot.querySelector("style");
    expect(styleElement?.textContent).toBe("color: red; background-color: blue; font-size: 16px; margin-top: 10px; padding: 5px 10px;");
  });

  it("should handle mixed array of strings and objects", () => {
    const mixedStyles = [
      "color: red;",
      { backgroundColor: "blue", fontSize: 14 },
      "border: 1px solid black;",
    ];

    applyStyles(shadowRoot, mixedStyles);

    const styleElement = shadowRoot.querySelector("style");
    const expectedCSS = [
      "color: red;",
      "background-color: blue; font-size: 14px;",
      "border: 1px solid black;",
    ].join("\n");
    expect(styleElement?.textContent).toBe(expectedCSS);
  });

  it("should handle numeric values correctly", () => {
    const styleObject = {
      width: 100, // Should add px
      height: 200, // Should add px
      zIndex: 999, // Should NOT add px
      opacity: 0.5, // Should NOT add px
      lineHeight: 1.5, // Should NOT add px
      fontWeight: 600, // Should NOT add px
    };

    applyStyles(shadowRoot, styleObject);

    const styleElement = shadowRoot.querySelector("style");
    expect(styleElement?.textContent).toBe("width: 100px; height: 200px; z-index: 999; opacity: 0.5; line-height: 1.5; font-weight: 600;");
  });
});
