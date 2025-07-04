/**
 * jsx-dev-runtime tests
 *
 * Tests for JSX development runtime functions
 */
import { describe, expect, it } from "vitest";

import { Fragment, Host, jsxDEV } from "../src/jsx-dev-runtime";

describe("jsx-dev-runtime", () => {
  it("should export jsxDEV function", () => {
    expect(typeof jsxDEV).toBe("function");
  });

  it("should export Fragment component", () => {
    expect(typeof Fragment).toBe("function");
  });

  it("should export Host component", () => {
    expect(typeof Host).toBe("function");
  });

  it("jsxDEV should work like jsx", () => {
    const result = jsxDEV("div", { id: "test", class: "container" });
    expect(result).toEqual({
      tag: "div",
      props: { id: "test", class: "container" },
    });
  });

  it("jsxDEV should handle null props", () => {
    const result = jsxDEV("span", null);
    expect(result).toEqual({
      tag: "span",
      props: {},
    });
  });

  it("fragment should work in dev mode", () => {
    const children = ["text", jsxDEV("div", {})];
    const result = Fragment({ children });
    const vnode = result();
    expect(vnode.tag).toBe("#fragment");
    expect(vnode.props.children).toBe(children);
  });

  it("host should work in dev mode", () => {
    const children = [jsxDEV("div", { children: ["content"] })];
    const result = Host({ children, shadowRoot: true });
    const vnode = result();
    expect(vnode.tag).toBe("#root");
    expect(vnode.props.shadowRoot).toBe(true);
  });
});
