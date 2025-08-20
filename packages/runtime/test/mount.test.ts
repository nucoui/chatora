import type { VNode } from "../src/methods/core/vNode";
/**
 * mount function tests
 *
 * Tests for DOM mounting functionality
 */
import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "../src/methods/genSD/mount";

describe("mount", () => {
  beforeEach(() => {
    // Clean up DOM between tests
    document.body.innerHTML = "";
  });

  it("should mount text node", () => {
    const vnode: VNode = {
      tag: "#text",
      props: {},
      children: ["hello world"],
    };
    const result = mount(vnode);
    expect(result.nodeType).toBe(Node.TEXT_NODE);
    expect(result.textContent).toBe("hello world");
  });

  it("should mount empty node as comment", () => {
    const vnode: VNode = {
      tag: "#empty",
      props: {},
      children: [],
    };
    const result = mount(vnode);
    expect(result.nodeType).toBe(Node.COMMENT_NODE);
  });

  it("should mount simple HTML element", () => {
    const vnode: VNode = {
      tag: "div",
      props: { id: "test", class: "container" },
      children: [],
    };
    const result = mount(vnode) as HTMLElement;
    expect(result.tagName).toBe("DIV");
    expect(result.id).toBe("test");
    expect(result.className).toBe("container");
  });

  it("should mount element with children", () => {
    const vnode: VNode = {
      tag: "div",
      props: {},
      children: [
        "text content",
        {
          tag: "span",
          props: { id: "child" },
          children: ["child text"],
        },
      ],
    };
    const result = mount(vnode) as HTMLElement;
    expect(result.childNodes.length).toBe(2);
    expect(result.childNodes[0].textContent).toBe("text content");
    expect((result.childNodes[1] as HTMLElement).tagName).toBe("SPAN");
    expect((result.childNodes[1] as HTMLElement).id).toBe("child");
  });

  it("should handle boolean attributes", () => {
    const vnode: VNode = {
      tag: "input",
      props: {
        disabled: true,
        hidden: false,
        readonly: true,
      },
      children: [],
    };
    const result = mount(vnode) as HTMLInputElement;
    expect(result.hasAttribute("disabled")).toBe(true);
    expect(result.hasAttribute("hidden")).toBe(false);
    expect(result.hasAttribute("readonly")).toBe(true);
  });

  it("should handle event handlers", () => {
    let clicked = false;
    const vnode: VNode = {
      tag: "button",
      props: {
        onclick: () => { clicked = true; },
      },
      children: ["click me"],
    };
    const result = mount(vnode) as HTMLButtonElement;
    result.click();
    expect(clicked).toBe(true);
  });

  it("should handle ref callback", () => {
    let refElement: HTMLElement | null = null;
    const vnode: VNode = {
      tag: "div",
      props: {
        ref: (el: HTMLElement) => { refElement = el; },
      },
      children: [],
    };
    const result = mount(vnode) as HTMLElement;
    expect(refElement).toBe(result);
  });

  it("should handle ref object", () => {
    const refObject = { current: null };
    const vnode: VNode = {
      tag: "div",
      props: {
        ref: refObject,
      },
      children: [],
    };
    const result = mount(vnode) as HTMLElement;
    expect(refObject.current).toBe(result);
  });

  it("should handle SVG elements", () => {
    const svgParent = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const vnode: VNode = {
      tag: "circle",
      props: { r: "10", cx: "50", cy: "50" },
      children: [],
    };
    const result = mount(vnode, svgParent) as SVGCircleElement;
    expect(result.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(result.getAttribute("r")).toBe("10");
  });

  it("should handle Math elements", () => {
    const mathParent = document.createElementNS("http://www.w3.org/1998/Math/MathML", "math");
    const vnode: VNode = {
      tag: "mi",
      props: {},
      children: ["x"],
    };
    const result = mount(vnode, mathParent) as Element;
    expect(result.namespaceURI).toBe("http://www.w3.org/1998/Math/MathML");
  });

  it("should handle null/undefined props", () => {
    const vnode: VNode = {
      tag: "div",
      props: {
        title: null,
        alt: undefined,
        id: "test",
      },
      children: [],
    };
    const result = mount(vnode) as HTMLElement;
    expect(result.hasAttribute("title")).toBe(false);
    expect(result.hasAttribute("alt")).toBe(false);
    expect(result.id).toBe("test");
  });

  it("should handle unknown tags", () => {
    const vnode: VNode = {
      tag: "unknown-tag",
      props: {},
      children: [],
    };
    const result = mount(vnode) as HTMLElement;
    expect(result.tagName).toBe("UNKNOWN-TAG");
    expect(result instanceof HTMLElement).toBe(true);
  });

  it("should optimize event handler detection", () => {
    let eventFired = false;
    const vnode: VNode = {
      tag: "button",
      props: {
        onmousedown: () => { eventFired = true; },
        onmouseup: () => { eventFired = true; },
      },
      children: [],
    };
    const result = mount(vnode) as HTMLButtonElement;

    // Test mousedown
    result.dispatchEvent(new MouseEvent("mousedown"));
    expect(eventFired).toBe(true);

    eventFired = false;

    // Test mouseup
    result.dispatchEvent(new MouseEvent("mouseup"));
    expect(eventFired).toBe(true);
  });

  it("should handle complex nested structure", () => {
    const vnode: VNode = {
      tag: "article",
      props: { class: "post" },
      children: [
        {
          tag: "header",
          props: {},
          children: [
            {
              tag: "h1",
              props: {},
              children: ["Title"],
            },
          ],
        },
        {
          tag: "main",
          props: {},
          children: [
            "Some text content",
            {
              tag: "p",
              props: {},
              children: ["Paragraph content"],
            },
          ],
        },
      ],
    };

    const result = mount(vnode) as HTMLElement;
    expect(result.tagName).toBe("ARTICLE");
    expect(result.className).toBe("post");
    expect(result.children.length).toBe(2);
    expect(result.children[0].tagName).toBe("HEADER");
    expect(result.children[1].tagName).toBe("MAIN");
    expect(result.querySelector("h1")?.textContent).toBe("Title");
    expect(result.querySelector("p")?.textContent).toBe("Paragraph content");
  });
});
