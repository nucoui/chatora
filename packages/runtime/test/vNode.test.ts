/**
 * vNode generation tests
 *
 * Tests for VNode generation and normalization functions
 */
import { describe, expect, it } from "vitest";
import { genVNode } from "../src/functionalCustomElement/vNode";

describe("genVNode", () => {
  it("should handle null values", () => {
    const result = genVNode(null);
    expect(result).toEqual({ tag: "#empty", props: {}, children: [] });
  });

  it("should handle undefined values", () => {
    const result = genVNode(undefined);
    expect(result).toEqual({ tag: "#empty", props: {}, children: [] });
  });

  it("should handle boolean values", () => {
    const resultTrue = genVNode(true);
    expect(resultTrue).toEqual({ tag: "#empty", props: {}, children: [] });

    const resultFalse = genVNode(false);
    expect(resultFalse).toEqual({ tag: "#empty", props: {}, children: [] });
  });

  it("should handle string values", () => {
    const result = genVNode("hello");
    expect(result).toEqual({ tag: "#text", props: {}, children: ["hello"] });
  });

  it("should handle number values", () => {
    const result = genVNode(42);
    expect(result).toEqual({ tag: "#text", props: {}, children: ["42"] });
  });

  it("should handle JSX elements with string tags", () => {
    const jsxElement = { tag: "div", props: { id: "test" } };
    const result = genVNode(jsxElement);
    expect(result).toEqual({
      tag: "div",
      props: { id: "test" },
      children: [],
    });
  });

  it("should handle JSX elements with children", () => {
    const jsxElement = {
      tag: "div",
      props: {
        id: "test",
        children: ["hello", "world"],
      },
    };
    const result = genVNode(jsxElement);
    expect(result.tag).toBe("div");
    expect(result.props.id).toBe("test");
    expect(result.children).toEqual(["hello", "world"]);
  });

  it("should handle function components", () => {
    const Component = (props: any) => () => ({ tag: "span", props: { text: props.text } });
    const jsxElement = {
      tag: Component,
      props: { text: "component" },
    };
    const result = genVNode(jsxElement);
    expect(result.tag).toBe("span");
    expect(result.props.text).toBe("component");
  });

  it("should handle function components that return functions", () => {
    const Component = () => {
      return () => ({ tag: "div", props: { class: "component" } });
    };
    const jsxElement = { tag: Component, props: {} };
    const result = genVNode(jsxElement);
    expect(result.tag).toBe("div");
    expect(result.props.class).toBe("component");
  });

  it("should handle function components with invalid return", () => {
    const Component = () => "invalid";
    const jsxElement = { tag: Component, props: {} };
    const result = genVNode(jsxElement);
    expect(result).toEqual({ tag: "#empty", props: {}, children: [] });
  });

  it("should handle unknown tag types", () => {
    const jsxElement = { tag: 123 as any, props: { test: "value" } };
    const result = genVNode(jsxElement);
    expect(result.tag).toBe("#unknown");
    expect(result.props.test).toBe("value");
  });

  it("should optimize empty props object", () => {
    const jsxElement = { tag: "div", props: {} };
    const result = genVNode(jsxElement);
    expect(result.props).toEqual({});
  });

  it("should handle complex nested children", () => {
    const jsxElement = {
      tag: "div",
      props: {
        children: [
          "text",
          42,
          null,
          undefined,
          ["nested", "array"],
          { tag: "span", props: { children: ["inner"] } },
        ],
      },
    };
    const result = genVNode(jsxElement);
    expect(result.children).toEqual([
      "text",
      "42",
      "nested",
      "array",
      { tag: "span", props: {}, children: ["inner"] },
    ]);
  });

  it("should throw error for invalid node types", () => {
    const invalidNode = Symbol("invalid") as any;
    expect(() => genVNode(invalidNode)).toThrow(/Cannot use 'in' operator/);
  });

  it("should handle fragment tags", () => {
    const jsxElement = {
      tag: "#fragment",
      props: {
        children: ["child1", "child2"],
      },
    };
    const result = genVNode(jsxElement);
    expect(result.tag).toBe("#fragment");
    expect(result.children).toEqual(["child1", "child2"]);
  });

  it("should handle root tags", () => {
    const jsxElement = {
      tag: "#root",
      props: {
        shadowRoot: true,
        children: ["child1"],
      },
    };
    const result = genVNode(jsxElement);
    expect(result.tag).toBe("#root");
    expect(result.props.shadowRoot).toBe(true);
    expect(result.children).toEqual(["child1"]);
  });
});
