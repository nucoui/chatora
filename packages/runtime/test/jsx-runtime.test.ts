/**
 * jsx-runtime tests
 *
 * Tests for JSX runtime functions
 */
import { describe, expect, it } from "vitest";

import { Fragment, Host, jsx, jsxs } from "../src/jsx-runtime";
import { genVNode } from "../src/methods/core/vNode";
import type { CC } from "../types/GenSD";

describe("jsx-runtime", () => {
  describe("jsx function", () => {
    it("should create JSX element with string tag", () => {
      const result = jsx("div", { id: "test", class: "container" });
      expect(result).toEqual({
        tag: "div",
        props: { id: "test", class: "container" },
      });
    });

    it("should create JSX element with null props", () => {
      const result = jsx("div", null);
      expect(result).toEqual({
        tag: "div",
        props: {},
      });
    });

    it("should create JSX element with CC component", () => {
      const Component: CC<any, any> = ({ defineProps }) => {
        return () => ({ tag: "div", props: {} });
      };
      const result = jsx(Component, { value: "test" });
      expect(result).toEqual({
        tag: Component,
        props: { value: "test" },
      });
    });

    it("should handle children in props", () => {
      const result = jsx("div", {
        id: "parent",
        children: ["text", jsx("span", { children: ["child"] })],
      });
      expect(result.props.id).toBe("parent");
      expect(Array.isArray(result.props.children)).toBe(true);
      expect((result.props.children as any)[0]).toBe("text");
    });

    it("should optimize empty props", () => {
      const result = jsx("div", {});
      expect(result.props).toEqual({});
    });
  });

  describe("jsxs function", () => {
    it("should be the same as jsx", () => {
      expect(jsxs).toBe(jsx);
    });

    it("should handle multiple children", () => {
      const result = jsxs("ul", {
        children: [
          jsx("li", { children: ["Item 1"] }),
          jsx("li", { children: ["Item 2"] }),
          jsx("li", { children: ["Item 3"] }),
        ],
      });
      expect(result.tag).toBe("ul");
      expect((result.props.children as any).length).toBe(3);
    });
  });

  describe("fragment component", () => {
    it("should create fragment with children array when executed as CC", () => {
      const children = ["text", jsx("div", {})];
      
      // Fragment is now a CC component, so we need to execute it properly
      const jsxElement = jsx(Fragment, { children });
      const vnode = genVNode(jsxElement);
      
      expect(vnode.tag).toBe("#fragment");
      expect(vnode.children).toEqual(["text", { tag: "div", props: {}, children: [] }]);
    });

    it("should create fragment with single child when executed as CC", () => {
      const child = "single text";
      
      const jsxElement = jsx(Fragment, { children: child });
      const vnode = genVNode(jsxElement);
      
      expect(vnode.tag).toBe("#fragment");
      expect(vnode.children).toEqual(["single text"]);
    });

    it("should handle nested fragments when executed as CC", () => {
      const children = [
        "text",
        jsx("div", {}),
      ];
      
      const jsxElement = jsx(Fragment, { children });
      const vnode = genVNode(jsxElement);
      
      expect(vnode.tag).toBe("#fragment");
      expect(vnode.children).toEqual(["text", { tag: "div", props: {}, children: [] }]);
    });
    });
  });

  describe("host component", () => {
    it("should create root with default shadowRoot", () => {
      const children = [jsx("div", { children: ["content"] })];
      const result = Host({ children });
      const vnode = result();
      expect(vnode.tag).toBe("#root");
      expect(vnode.props.children).toBe(children);
    });

    it("should create root with custom shadowRoot options", () => {
      const children = ["content"];
      const result = Host({
        children,
        shadowRoot: true,
        shadowRootMode: "closed",
      });
      const vnode = result();
      expect(vnode.tag).toBe("#root");
      expect(vnode.props.shadowRoot).toBe(true);
      expect(vnode.props.shadowRootMode).toBe("closed");
      expect(vnode.props.children).toBe(children);
    });

    it("should create root with disabled shadowRoot", () => {
      const children = ["content"];
      const result = Host({
        children,
        shadowRoot: false,
      });
      const vnode = result();
      expect(vnode.props.shadowRoot).toBe(false);
      expect(vnode.props.shadowRootMode).toBeUndefined();
    });

    it("should handle style prop", () => {
      const children = ["content"];
      const style = "color: red;";
      const result = Host({ children, style });
      const vnode = result();
      expect(vnode.props.style).toBe(style);
    });

    it("should handle style array", () => {
      const children = ["content"];
      const style = ["color: red;", "background: blue;"];
      const result = Host({ children, style });
      const vnode = result();
      expect(vnode.props.style).toBe(style);
    });

    it("should handle style object", () => {
      const children = ["content"];
      const style = { color: "red", backgroundColor: "blue", fontSize: 16 };
      const result = Host({ children, style });
      const vnode = result();
      expect(vnode.props.style).toBe(style);
    });

    it("should handle mixed style array", () => {
      const children = ["content"];
      const style = ["color: red;", { backgroundColor: "blue", fontSize: 16 }];
      const result = Host({ children, style });
      const vnode = result();
      expect(vnode.props.style).toBe(style);
    });

    it("should handle single child", () => {
      const child = jsx("div", { children: ["single"] });
      const result = Host({ children: child });
      const vnode = result();
      expect(vnode.props.children).toEqual([child]);
    });
  });

  describe("integration tests", () => {
    it("should work with complex component structure using CC", () => {
      // Convert App to CC component
      const App: CC<{ title?: string }, {}> = ({ defineProps }) => {
        const props = defineProps({
          title: (v) => v || "Default Title",
        });

        return () => jsx("div", {
          children: [
            jsx("h1", { children: [props().title] }),
            jsx(Fragment, {
              children: [
                jsx("p", { children: ["Paragraph 1"] }),
                jsx("p", { children: ["Paragraph 2"] }),
              ],
            }),
          ],
        });
      };

      const result = Host({
        children: jsx(App, { title: "My App" }),
        shadowRoot: true,
        style: "font-family: Arial;",
      });

      const vnode = result();
      expect(vnode.tag).toBe("#root");
      expect(vnode.props.shadowRoot).toBe(true);
      expect(vnode.props.style).toBe("font-family: Arial;");
    });

    it("should handle empty children arrays", () => {
      const result = Fragment({ children: [] });
      const vnode = result();
      expect(vnode.props.children).toEqual([]);
    });

    it("should handle null children", () => {
      const result = Fragment({ children: null as any });
      const vnode = result();
      expect(vnode.props.children).toEqual([null]);
    });

    it("should handle undefined children", () => {
      const result = Fragment({ children: undefined as any });
      const vnode = result();
      expect(vnode.props.children).toEqual([undefined]);
    });
  });
});
