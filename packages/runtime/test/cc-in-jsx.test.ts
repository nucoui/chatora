/**
 * Test for CC components used in JSX syntax
 */
import { describe, expect, it, vi } from "vitest";
import { jsx } from "../src/jsx-runtime";
import { genVNode } from "../src/methods/core/vNode";
import { signal } from "@chatora/reactivity";
import type { CC } from "../types/GenSD";

describe("CC components in JSX", () => {
  it("should render CC component within JSX", () => {
    // Create a simple CC component
    const TestCC: CC<{ message?: string }, {}> = ({ defineProps }) => {
      const props = defineProps({
        message: (v) => v || "default message",
      });

      return () => ({
        tag: "div",
        props: {
          children: `Hello: ${props().message}`,
        },
      });
    };

    // Use CC in JSX syntax
    const jsxElement = jsx(TestCC, { message: "test" });
    const vnode = genVNode(jsxElement);

    expect(vnode.tag).toBe("div");
    expect(vnode.children).toEqual(["Hello: test"]);
  });

  it("should handle CC component with signals", () => {
    const TestCCWithSignal: CC<{ count?: string }, {}> = ({ defineProps }) => {
      const props = defineProps({
        count: (v) => Number(v) || 0,
      });

      const localSignal = signal("test");

      return () => ({
        tag: "span",
        props: {
          children: `Count: ${props().count}, Signal: ${localSignal.value}`,
        },
      });
    };

    const jsxElement = jsx(TestCCWithSignal, { count: "5" });
    const vnode = genVNode(jsxElement);

    expect(vnode.tag).toBe("span");
    expect(vnode.children).toEqual(["Count: 5, Signal: test"]);
  });

  it("should handle CC component that returns array", () => {
    const TestCCArray: CC<{}, {}> = () => {
      return () => [
        { tag: "div", props: { children: "First" } },
        { tag: "div", props: { children: "Second" } },
      ];
    };

    const jsxElement = jsx(TestCCArray, {});
    const vnode = genVNode(jsxElement);

    expect(vnode.tag).toBe("#fragment");
    expect(vnode.children).toHaveLength(2);
    expect(vnode.children[0]).toMatchObject({
      tag: "div",
      children: ["First"],
    });
    expect(vnode.children[1]).toMatchObject({
      tag: "div",
      children: ["Second"],
    });
  });

  it("should distinguish CC from IC components", () => {
    // IC component (takes props directly)
    const TestIC = (props: { text: string }) => {
      return () => ({
        tag: "p",
        props: { children: props.text },
      });
    };

    // CC component (takes { defineProps, defineEmits })
    const TestCC: CC<{ text?: string }, {}> = ({ defineProps }) => {
      const props = defineProps({
        text: (v) => v || "default",
      });

      return () => ({
        tag: "span",
        props: { children: props().text },
      });
    };

    // Test IC
    const icElement = jsx(TestIC, { text: "IC test" });
    const icVnode = genVNode(icElement);
    expect(icVnode.tag).toBe("p");
    expect(icVnode.children).toEqual(["IC test"]);

    // Test CC
    const ccElement = jsx(TestCC, { text: "CC test" });
    const ccVnode = genVNode(ccElement);
    expect(ccVnode.tag).toBe("span");
    expect(ccVnode.children).toEqual(["CC test"]);
  });

  it("should handle CC component that emits events (no-op in JSX context)", () => {
    const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    const TestCCWithEmits: CC<{}, { "on-click": Event }> = ({ defineEmits }) => {
      const emits = defineEmits({
        "on-click": () => {},
      });

      // Try to emit an event
      emits("on-click", new Event("click"));

      return () => ({
        tag: "button",
        props: { children: "Click me" },
      });
    };

    const jsxElement = jsx(TestCCWithEmits, {});
    const vnode = genVNode(jsxElement);

    expect(vnode.tag).toBe("button");
    expect(vnode.children).toEqual(["Click me"]);
    
    // Verify that the emit was logged as debug
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('CC component in JSX context attempted to emit "on-click"'),
      expect.any(Event)
    );

    consoleSpy.mockRestore();
  });

  it("should handle CC component with error gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Make sure this is detected as CC by adding empty destructuring
    const BrokenCC: CC<{}, {}> = ({}) => {
      throw new Error("Test error");
    };

    const jsxElement = jsx(BrokenCC, {});
    const vnode = genVNode(jsxElement);

    expect(vnode.tag).toBe("#empty");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Error (executing|in) CC/),
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});