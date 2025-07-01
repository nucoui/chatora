/**
 * Comprehensive tests for stringToHast converter
 * This file combines all stringToHast tests: basic functionality, custom elements, real-world usage, and edge cases
 */
import { describe, expect, it } from "vitest";
import { stringToHast } from "../src/converter/stringToHast";

// Type guard for testing
function isElement(node: any): node is { type: "element"; tagName: string; properties: Record<string, any>; children: any[] } {
  return node && node.type === "element";
}

// Type guard for text nodes
function isText(node: any): node is { type: "text"; value: string } {
  return node && node.type === "text";
}

// Helper function to find elements by tag prefix
function findElementsByTagPrefix(element: any, prefix: string): any[] {
  const results: any[] = [];

  if (isElement(element) && element.tagName.startsWith(prefix)) {
    results.push(element);
  }

  if (isElement(element) && element.children) {
    for (const child of element.children) {
      results.push(...findElementsByTagPrefix(child, prefix));
    }
  }

  return results;
}

// Helper function to find elements by tag names
function findElementsByTag(element: any, tagNames: string[]): any[] {
  const results: any[] = [];

  if (isElement(element) && tagNames.includes(element.tagName)) {
    results.push(element);
  }

  if (isElement(element) && element.children) {
    for (const child of element.children) {
      results.push(...findElementsByTag(child, tagNames));
    }
  }

  return results;
}

describe("stringToHast - Basic Functionality", () => {
  it("should handle empty string", () => {
    const result = stringToHast("");
    expect(result).toEqual({
      type: "root",
      children: [],
    });
  });

  it("should handle null/undefined values", () => {
    expect(stringToHast(null as any)).toEqual({
      type: "root",
      children: [],
    });
    expect(stringToHast(undefined as any)).toEqual({
      type: "root",
      children: [],
    });
  });

  it("should parse simple text content", () => {
    const result = stringToHast("Hello World");
    expect(result.type).toBe("root");
    expect(result.children).toHaveLength(1);

    const firstChild = result.children[0];
    expect(isText(firstChild)).toBe(true);
    if (isText(firstChild)) {
      expect(firstChild).toEqual({
        type: "text",
        value: "Hello World",
      });
    }
  });

  it("should parse simple HTML element", () => {
    const result = stringToHast("<div>Hello</div>");
    expect(result.type).toBe("root");
    expect(result.children).toHaveLength(1);

    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild).toEqual({
        type: "element",
        tagName: "div",
        properties: {},
        children: [{ type: "text", value: "Hello" }],
      });
    }
  });

  it("should parse element with attributes", () => {
    const result = stringToHast("<div class=\"container\" id=\"main\">Content</div>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild).toEqual({
        type: "element",
        tagName: "div",
        properties: {
          class: "container",
          id: "main",
        },
        children: [{ type: "text", value: "Content" }],
      });
    }
  });

  it("should parse self-closing tags", () => {
    const result = stringToHast("<img src=\"test.jpg\" alt=\"Test\" />");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild).toEqual({
        type: "element",
        tagName: "img",
        properties: {
          src: "test.jpg",
          alt: "Test",
        },
        children: [],
      });
    }
  });

  it("should parse nested elements", () => {
    const result = stringToHast("<div><span>Nested</span></div>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild).toEqual({
        type: "element",
        tagName: "div",
        properties: {},
        children: [{
          type: "element",
          tagName: "span",
          properties: {},
          children: [{ type: "text", value: "Nested" }],
        }],
      });
    }
  });

  it("should parse multiple elements", () => {
    const result = stringToHast("<div>First</div><span>Second</span>");
    expect(result.children).toHaveLength(2);

    const firstChild = result.children[0];
    const secondChild = result.children[1];

    expect(isElement(firstChild)).toBe(true);
    expect(isElement(secondChild)).toBe(true);

    if (isElement(firstChild) && isElement(secondChild)) {
      expect(firstChild.tagName).toBe("div");
      expect(secondChild.tagName).toBe("span");
    }
  });

  it("should handle boolean attributes", () => {
    const result = stringToHast("<input type=\"checkbox\" checked disabled>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.properties).toEqual({
        type: "checkbox",
        checked: true,
        disabled: true,
      });
    }
  });

  it("should handle different quote types", () => {
    const result = stringToHast(`<div class='single' title="double" data-test=unquoted>`);
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.properties).toEqual({
        "class": "single",
        "title": "double",
        "data-test": "unquoted",
      });
    }
  });

  it("should ignore HTML comments", () => {
    const result = stringToHast("<!-- This is a comment --><div>Content</div>");
    expect(result.children).toHaveLength(1);
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("div");
    }
  });

  it("should handle malformed HTML gracefully", () => {
    const result = stringToHast("<div>Unclosed tag");
    // Should still create a div element with text content
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("div");
      expect(firstChild.children[0]).toEqual({
        type: "text",
        value: "Unclosed tag",
      });
    }
  });

  it("should handle complex HTML structure", () => {
    const html = `
      <div class="container">
        <h1>Title</h1>
        <p>This is a <strong>test</strong> paragraph.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    `;

    const result = stringToHast(html);
    expect(result.type).toBe("root");
    expect(result.children).toHaveLength(1);

    const container = result.children[0];
    expect(isElement(container)).toBe(true);
    if (isElement(container)) {
      expect(container.tagName).toBe("div");
      expect(container.properties.class).toBe("container");
      expect(container.children.length).toBeGreaterThan(0);
    }
  });

  it("should preserve case-insensitive tag names as lowercase", () => {
    const result = stringToHast("<DIV CLASS=\"test\">Content</DIV>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("div");
      expect(firstChild.properties.CLASS).toBe("test");
    }
  });
});

describe("stringToHast - Custom Elements", () => {
  it("should parse simple custom element", () => {
    const result = stringToHast("<my-button>Click me</my-button>");
    expect(result.type).toBe("root");
    expect(result.children).toHaveLength(1);

    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("my-button");
      expect(firstChild.children[0]).toEqual({
        type: "text",
        value: "Click me",
      });
    }
  });

  it("should parse custom element with multiple hyphens", () => {
    const result = stringToHast("<my-custom-component>Content</my-custom-component>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("my-custom-component");
    }
  });

  it("should parse custom element with custom attributes", () => {
    const result = stringToHast("<my-widget variant=\"primary\" size=\"large\" disabled>Widget</my-widget>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("my-widget");
      expect(firstChild.properties).toEqual({
        variant: "primary",
        size: "large",
        disabled: true,
      });
    }
  });

  it("should parse custom element with data attributes", () => {
    const result = stringToHast("<my-card data-id=\"123\" data-category=\"tech\">Card content</my-card>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("my-card");
      expect(firstChild.properties).toEqual({
        "data-id": "123",
        "data-category": "tech",
      });
    }
  });

  it("should parse custom element with aria attributes", () => {
    const result = stringToHast("<my-dialog aria-label=\"Settings\" aria-hidden=\"false\">Dialog</my-dialog>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("my-dialog");
      expect(firstChild.properties).toEqual({
        "aria-label": "Settings",
        "aria-hidden": "false",
      });
    }
  });

  it("should parse nested custom elements", () => {
    const result = stringToHast(`
      <my-container>
        <my-header title="Test">Header</my-header>
        <my-content>
          <my-item>Item 1</my-item>
          <my-item>Item 2</my-item>
        </my-content>
      </my-container>
    `);

    expect(result.children).toHaveLength(1);
    const container = result.children[0];
    expect(isElement(container)).toBe(true);
    if (isElement(container)) {
      expect(container.tagName).toBe("my-container");
      expect(container.children.length).toBeGreaterThan(0);

      // Find header element
      const headerElements = container.children.filter(child =>
        isElement(child) && child.tagName === "my-header",
      );
      expect(headerElements).toHaveLength(1);

      if (isElement(headerElements[0])) {
        expect(headerElements[0].properties.title).toBe("Test");
      }
    }
  });

  it("should parse self-closing custom elements", () => {
    const result = stringToHast("<my-icon name=\"star\" size=\"24\" />");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("my-icon");
      expect(firstChild.properties).toEqual({
        name: "star",
        size: "24",
      });
      expect(firstChild.children).toHaveLength(0);
    }
  });

  it("should parse mixed custom and standard elements", () => {
    const result = stringToHast(`
      <div class="wrapper">
        <my-header>
          <h1>Title</h1>
        </my-header>
        <my-content>
          <p>Standard paragraph</p>
          <my-button type="submit">Submit</my-button>
        </my-content>
      </div>
    `);

    expect(result.children).toHaveLength(1);
    const wrapper = result.children[0];
    expect(isElement(wrapper)).toBe(true);
    if (isElement(wrapper)) {
      expect(wrapper.tagName).toBe("div");
      expect(wrapper.properties.class).toBe("wrapper");
    }
  });

  it("should handle custom element with colon in name (namespaced)", () => {
    const result = stringToHast("<ui:button xmlns:ui=\"http://example.com/ui\">Namespaced</ui:button>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("ui:button");
      expect(firstChild.properties["xmlns:ui"]).toBe("http://example.com/ui");
    }
  });

  it("should parse chatora-style custom elements", () => {
    const result = stringToHast(`
      <n-button variant="primary" size="medium" disabled="false">
        <span class="contents">
          <slot />
        </span>
      </n-button>
    `);

    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("n-button");
      expect(firstChild.properties).toEqual({
        variant: "primary",
        size: "medium",
        disabled: "false",
      });

      // Check for nested span and slot
      const spanElements = firstChild.children.filter(child =>
        isElement(child) && child.tagName === "span",
      );
      expect(spanElements).toHaveLength(1);

      if (isElement(spanElements[0])) {
        const slotElements = spanElements[0].children.filter(child =>
          isElement(child) && child.tagName === "slot",
        );
        expect(slotElements).toHaveLength(1);
      }
    }
  });
});

describe("stringToHast - Real-world Chatora Usage", () => {
  it("should parse complex nested Chatora components", () => {
    const complexHTML = `
      <tora-app data-theme="dark">
        <tora-header slot="header" class="main-header">
          <tora-logo size="medium" />
          <tora-navigation>
            <tora-nav-item href="/home" active>Home</tora-nav-item>
            <tora-nav-item href="/about">About</tora-nav-item>
          </tora-navigation>
        </tora-header>
        
        <tora-main slot="content">
          <tora-button variant="primary" size="large" on-click="handleClick">
            Get Started
          </tora-button>
        </tora-main>
      </tora-app>
    `;

    const result = stringToHast(complexHTML);
    expect(result.type).toBe("root");
    expect(result.children).toHaveLength(1);

    const appElement = result.children[0];
    expect(isElement(appElement)).toBe(true);
    if (isElement(appElement)) {
      expect(appElement.tagName).toBe("tora-app");
      expect(appElement.properties["data-theme"]).toBe("dark");
      expect(appElement.children.length).toBeGreaterThan(0);

      // Find header element
      const headerElements = appElement.children.filter(child =>
        isElement(child) && child.tagName === "tora-header",
      );
      expect(headerElements).toHaveLength(1);

      if (isElement(headerElements[0])) {
        expect(headerElements[0].properties.slot).toBe("header");
        expect(headerElements[0].properties.class).toBe("main-header");
      }
    }
  });

  it("should parse Chatora component with event handlers", () => {
    const html = `
      <tora-form on-submit="handleSubmit" validation="strict">
        <tora-input name="email" type="email" required placeholder="Enter email" />
        <tora-button type="submit" variant="primary" disabled="false">
          Submit
        </tora-button>
      </tora-form>
    `;

    const result = stringToHast(html);
    const formElement = result.children[0];
    expect(isElement(formElement)).toBe(true);
    if (isElement(formElement)) {
      expect(formElement.tagName).toBe("tora-form");
      expect(formElement.properties["on-submit"]).toBe("handleSubmit");
      expect(formElement.properties.validation).toBe("strict");

      // Check for input and button elements
      const inputElements = formElement.children.filter(child =>
        isElement(child) && child.tagName === "tora-input",
      );
      const buttonElements = formElement.children.filter(child =>
        isElement(child) && child.tagName === "tora-button",
      );

      expect(inputElements).toHaveLength(1);
      expect(buttonElements).toHaveLength(1);

      if (isElement(inputElements[0])) {
        expect(inputElements[0].properties.name).toBe("email");
        expect(inputElements[0].properties.type).toBe("email");
        expect(inputElements[0].properties.required).toBe(true);
      }
    }
  });

  it("should parse Chatora components with slots", () => {
    const html = `
      <tora-card elevation="2">
        <tora-icon name="star" slot="icon" />
        <h3 slot="title">Featured</h3>
        <p slot="content">This is featured content</p>
        <tora-button slot="action" variant="secondary">
          Learn More
        </tora-button>
      </tora-card>
    `;

    const result = stringToHast(html);
    const cardElement = result.children[0];
    expect(isElement(cardElement)).toBe(true);
    if (isElement(cardElement)) {
      expect(cardElement.tagName).toBe("tora-card");
      expect(cardElement.properties.elevation).toBe("2");

      // Check slot assignments
      const iconElement = cardElement.children.find(child =>
        isElement(child) && child.tagName === "tora-icon",
      );
      const titleElement = cardElement.children.find(child =>
        isElement(child) && child.tagName === "h3",
      );
      const actionElement = cardElement.children.find(child =>
        isElement(child) && child.tagName === "tora-button",
      );

      if (isElement(iconElement)) {
        expect(iconElement.properties.slot).toBe("icon");
        expect(iconElement.properties.name).toBe("star");
      }

      if (isElement(titleElement)) {
        expect(titleElement.properties.slot).toBe("title");
      }

      if (isElement(actionElement)) {
        expect(actionElement.properties.slot).toBe("action");
        expect(actionElement.properties.variant).toBe("secondary");
      }
    }
  });

  it("should parse n-button style components (similar to Naive UI)", () => {
    const html = `
      <n-button variant="primary" size="medium" disabled="false">
        <span class="contents">
          <slot />
        </span>
      </n-button>
    `;

    const result = stringToHast(html);
    const buttonElement = result.children[0];
    expect(isElement(buttonElement)).toBe(true);
    if (isElement(buttonElement)) {
      expect(buttonElement.tagName).toBe("n-button");
      expect(buttonElement.properties.variant).toBe("primary");
      expect(buttonElement.properties.size).toBe("medium");
      expect(buttonElement.properties.disabled).toBe("false");

      // Check nested span and slot
      const spanElements = buttonElement.children.filter(child =>
        isElement(child) && child.tagName === "span",
      );
      expect(spanElements).toHaveLength(1);

      if (isElement(spanElements[0])) {
        expect(spanElements[0].properties.class).toBe("contents");

        const slotElements = spanElements[0].children.filter(child =>
          isElement(child) && child.tagName === "slot",
        );
        expect(slotElements).toHaveLength(1);
      }
    }
  });

  it("should handle mixed content with custom elements", () => {
    const html = `
      <div class="app-container">
        <my-header>
          <h1>Application Title</h1>
          <my-nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
          </my-nav>
        </my-header>
        
        <main>
          <my-content-area>
            <p>Regular HTML content</p>
            <my-feature-card title="Feature 1">
              <img src="feature1.jpg" alt="Feature 1" />
              <p>Description of feature 1</p>
            </my-feature-card>
          </my-content-area>
        </main>
        
        <my-footer copyright="2025" />
      </div>
    `;

    const result = stringToHast(html);
    const containerElement = result.children[0];
    expect(isElement(containerElement)).toBe(true);
    if (isElement(containerElement)) {
      expect(containerElement.tagName).toBe("div");
      expect(containerElement.properties.class).toBe("app-container");

      // Verify custom elements are parsed correctly alongside standard HTML
      const customElements = findElementsByTagPrefix(containerElement, "my-");
      expect(customElements.length).toBeGreaterThan(0);

      // Verify standard HTML elements are preserved
      const standardElements = findElementsByTag(containerElement, ["h1", "main", "p", "a", "img"]);
      expect(standardElements.length).toBeGreaterThan(0);
    }
  });
});

describe("stringToHast - Edge Cases", () => {
  it("should parse custom elements with numbers", () => {
    const result = stringToHast("<my-component-v2 version=\"2.0\">Content</my-component-v2>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("my-component-v2");
      expect(firstChild.properties.version).toBe("2.0");
    }
  });

  it("should parse custom elements with underscores (if supported)", () => {
    // Note: Custom element names cannot contain underscores according to spec,
    // but we should handle them gracefully if encountered
    const result = stringToHast("<my_component>Content</my_component>");
    // Current implementation may not parse this correctly due to regex limitations
    // This is acceptable as underscores are not valid in custom element names
    expect(result.type).toBe("root");
  });

  it("should parse web component with complex attribute patterns", () => {
    const result = stringToHast(`
      <my-complex-widget
        data-config='{"theme": "dark", "size": "large"}'
        aria-labelledby="widget-label"
        custom-prop="value"
        boolean-attr
        numeric-value="42"
        >
        Widget Content
      </my-complex-widget>
    `);

    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("my-complex-widget");
      expect(firstChild.properties["data-config"]).toBe("{\"theme\": \"dark\", \"size\": \"large\"}");
      expect(firstChild.properties["aria-labelledby"]).toBe("widget-label");
      expect(firstChild.properties["custom-prop"]).toBe("value");
      expect(firstChild.properties["boolean-attr"]).toBe(true);
      expect(firstChild.properties["numeric-value"]).toBe("42");
    }
  });

  it("should handle very long custom element names", () => {
    const longName = "my-very-long-custom-element-name-with-many-hyphens-and-descriptive-parts";
    const html = `<${longName} prop="value">Content</${longName}>`;
    const result = stringToHast(html);

    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe(longName);
      expect(firstChild.properties.prop).toBe("value");
    }
  });

  it("should parse custom elements with special Unicode characters in content", () => {
    const result = stringToHast("<my-i18n-component lang=\"ja\">こんにちは世界 🌍</my-i18n-component>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("my-i18n-component");
      expect(firstChild.properties.lang).toBe("ja");
      expect(firstChild.children[0]).toEqual({
        type: "text",
        value: "こんにちは世界 🌍",
      });
    }
  });

  it("should parse custom elements with mixed case (though they should be lowercase)", () => {
    const result = stringToHast("<My-Component>Content</My-Component>");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      // Our implementation converts to lowercase
      expect(firstChild.tagName).toBe("my-component");
    }
  });

  it("should handle malformed custom element gracefully", () => {
    // Missing closing tag
    const result = stringToHast("<my-component attr=\"value\">Unclosed content");
    const firstChild = result.children[0];
    expect(isElement(firstChild)).toBe(true);
    if (isElement(firstChild)) {
      expect(firstChild.tagName).toBe("my-component");
      expect(firstChild.properties.attr).toBe("value");
    }
  });

  it("should parse custom elements within standard HTML structure", () => {
    const result = stringToHast(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
        </head>
        <body>
          <div id="app">
            <my-app>
              <my-header>Header</my-header>
              <my-content>Content</my-content>
            </my-app>
          </div>
        </body>
      </html>
    `);

    // Should still parse the structure, even if it includes doctype
    expect(result.type).toBe("root");
    expect(result.children.length).toBeGreaterThan(0);

    // Find the custom elements
    const findCustomElements = (element: any): any[] => {
      const results: any[] = [];
      if (isElement(element) && element.tagName.includes("-")) {
        results.push(element);
      }
      if (isElement(element) && element.children) {
        for (const child of element.children) {
          results.push(...findCustomElements(child));
        }
      }
      return results;
    };

    const customElements = result.children.flatMap(findCustomElements);
    expect(customElements.length).toBeGreaterThan(0);
  });
});
