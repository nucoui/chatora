/**
 * Tests for hastToJsx converter
 */
import { describe, expect, it } from "vitest";
import { hastToJsx } from "../src/converter/hastToJsx";
import { stringToHast } from "../src/converter/stringToHast";

describe("hastToJsx", () => {
  it("should convert simple element to JSX", () => {
    const hast = stringToHast("<div>Hello World</div>");
    const jsx = hastToJsx(hast);

    expect(jsx.tag).toBe("#fragment");
    expect(jsx.props.children).toEqual([{
      tag: "div",
      props: { children: "Hello World" },
    }]);
  });

  it("should convert element with attributes to JSX", () => {
    const hast = stringToHast("<div class=\"container\" id=\"main\">Content</div>");
    const jsx = hastToJsx(hast);

    expect(jsx.tag).toBe("#fragment");
    const child = (jsx.props.children as any[])[0];
    expect(child.tag).toBe("div");
    expect(child.props.class).toBe("container");
    expect(child.props.id).toBe("main");
    expect(child.props.children).toBe("Content");
  });

  it("should convert nested elements to JSX", () => {
    const hast = stringToHast("<div><span>Nested</span></div>");
    const jsx = hastToJsx(hast);

    expect(jsx.tag).toBe("#fragment");
    const children = (jsx.props.children as any[])[0];
    expect(children.tag).toBe("div");
    const spanChild = children.props.children;
    expect(spanChild.tag).toBe("span");
    expect(spanChild.props.children).toBe("Nested");
  });

  it("should convert multiple elements to JSX wrapped in fragment", () => {
    const hast = stringToHast("<div>First</div><span>Second</span>");
    const jsx = hastToJsx(hast);

    expect(jsx.tag).toBe("#fragment");
    const children = jsx.props.children as any[];
    expect(Array.isArray(children)).toBe(true);
    expect(children).toHaveLength(2);
    expect(children[0].tag).toBe("div");
    expect(children[0].props.children).toBe("First");
    expect(children[1].tag).toBe("span");
    expect(children[1].props.children).toBe("Second");
  });

  it("should convert custom elements to JSX", () => {
    const hast = stringToHast("<my-button variant=\"primary\">Click me</my-button>");
    const jsx = hastToJsx(hast);

    expect(jsx.tag).toBe("#fragment");
    const child = (jsx.props.children as any[])[0];
    expect(child.tag).toBe("my-button");
    expect(child.props.variant).toBe("primary");
    expect(child.props.children).toBe("Click me");
  });

  it("should handle self-closing elements", () => {
    const hast = stringToHast("<img src=\"test.jpg\" alt=\"Test\" />");
    const jsx = hastToJsx(hast);

    expect(jsx.tag).toBe("#fragment");
    const child = (jsx.props.children as any[])[0];
    expect(child.tag).toBe("img");
    expect(child.props.src).toBe("test.jpg");
    expect(child.props.alt).toBe("Test");
    expect(child.props.children).toBeUndefined();
  });

  it("should handle complex nested structure", () => {
    const hast = stringToHast(`
      <div class="container">
        <h1>Title</h1>
        <p>Paragraph</p>
      </div>
    `);
    const jsx = hastToJsx(hast);

    expect(jsx.tag).toBe("#fragment");
    const child = (jsx.props.children as any[])[0];
    expect(child.tag).toBe("div");
    expect(child.props.class).toBe("container");
    const children = child.props.children;
    expect(Array.isArray(children)).toBe(true);
    expect(children).toHaveLength(2);
    expect(children[0].tag).toBe("h1");
    expect(children[0].props.children).toBe("Title");
    expect(children[1].tag).toBe("p");
    expect(children[1].props.children).toBe("Paragraph");
  });

  it("should handle empty root", () => {
    const hast = stringToHast("");
    const jsx = hastToJsx(hast);

    expect(jsx.tag).toBe("#fragment");
    expect(jsx.props.children).toEqual([]);
  });

  it("should handle text only content", () => {
    const hast = stringToHast("Hello World");
    const jsx = hastToJsx(hast);
    
    expect(jsx.tag).toBe("#fragment");
    const child = (jsx.props.children as any[])[0];
    expect(typeof child).toBe("string");
    expect(child).toBe("Hello World");
  });

  it("should convert chatora-style custom elements", () => {
    const hast = stringToHast(`
      <tora-button variant="primary" size="medium" disabled="false">
        <span class="contents">Submit</span>
      </tora-button>
    `);
    const jsx = hastToJsx(hast);

    expect(jsx.tag).toBe("#fragment");
    const child = (jsx.props.children as any[])[0];
    expect(child.tag).toBe("tora-button");
    expect(child.props.variant).toBe("primary");
    expect(child.props.size).toBe("medium");
    expect(child.props.disabled).toBe("false");
    
    const spanChild = child.props.children;
    expect(spanChild.tag).toBe("span");
    expect(spanChild.props.class).toBe("contents");
    expect(spanChild.props.children).toBe("Submit");
  });
});
