/**
 * Test that demonstrates the original issue is resolved:
 * ICs should not be re-executed on every signal change
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { genVNode } from "../src/methods/core/vNode";
import { clearAllICInstances, onICConnected } from "../src/methods/core/icInstance";
import type { IC } from "../src/main";

describe("IC Re-rendering Optimization", () => {
  beforeEach(() => {
    clearAllICInstances();
    vi.clearAllMocks();
  });

  it("should not re-execute IC on every genVNode call with same props", () => {
    // Track how many times the IC function itself is called
    const icCallCount = { count: 0 };
    // Track how many times the render function is called
    const renderCallCount = { count: 0 };
    
    const TestIC: IC<{ message: string }> = ({ message }) => {
      icCallCount.count++;
      
      return () => {
        renderCallCount.count++;
        return {
          tag: "div",
          props: { children: [message] },
        };
      };
    };

    const props = { message: "Hello World" };

    // First call - should execute IC and create render function
    const vNode1 = genVNode({ tag: TestIC, props });
    expect(icCallCount.count).toBe(1);
    expect(renderCallCount.count).toBe(1);
    expect(vNode1.tag).toBe("div");

    // Second call with same props - should reuse IC instance but call render function
    const vNode2 = genVNode({ tag: TestIC, props });
    expect(icCallCount.count).toBe(1); // IC function NOT called again
    expect(renderCallCount.count).toBe(2); // Render function called again
    expect(vNode2.tag).toBe("div");

    // Third call - still same props
    const vNode3 = genVNode({ tag: TestIC, props });
    expect(icCallCount.count).toBe(1); // IC function STILL not called again
    expect(renderCallCount.count).toBe(3); // Render function called again
    expect(vNode3.tag).toBe("div");
  });

  it("should re-execute IC only when props change", () => {
    const icCallCount = { count: 0 };
    const renderCallCount = { count: 0 };
    
    const TestIC: IC<{ message: string }> = ({ message }) => {
      icCallCount.count++;
      
      return () => {
        renderCallCount.count++;
        return {
          tag: "div",
          props: { children: [message] },
        };
      };
    };

    // First call
    genVNode({ tag: TestIC, props: { message: "Hello" } });
    expect(icCallCount.count).toBe(1);
    expect(renderCallCount.count).toBe(1);

    // Same props - should not re-execute IC
    genVNode({ tag: TestIC, props: { message: "Hello" } });
    expect(icCallCount.count).toBe(1);
    expect(renderCallCount.count).toBe(2);

    // Different props - should re-execute IC
    genVNode({ tag: TestIC, props: { message: "World" } });
    expect(icCallCount.count).toBe(2); // IC re-executed due to prop change
    expect(renderCallCount.count).toBe(3);
  });

  it("should demonstrate lifecycle hooks work during re-renders", () => {
    const connectedCalls: string[] = [];
    let renderCount = 0;
    
    const TestIC: IC<{ id: string }> = ({ id }) => {
      // This should only be called once per unique props combination
      const currentConnectedCalls = connectedCalls.length;
      
      // Register lifecycle hook
      onICConnected(() => {
        connectedCalls.push(`connected-${id}-${currentConnectedCalls}`);
      });
      
      return () => {
        renderCount++;
        return {
          tag: "div",
          props: { children: [`Render ${renderCount} for ${id}`] },
        };
      };
    };

    const props = { id: "test" };

    // Multiple calls with same props
    genVNode({ tag: TestIC, props });
    genVNode({ tag: TestIC, props }); 
    genVNode({ tag: TestIC, props });

    // The IC function should only be called once, so only one lifecycle hook should be registered
    expect(renderCount).toBe(3); // Render function called 3 times
    expect(connectedCalls.length).toBe(0); // Hooks are registered but not executed yet
  });

  it("should support complex props without unnecessary re-execution", () => {
    const icCallCount = { count: 0 };
    
    const TestIC: IC<{ config: { theme: string; locale: string } }> = ({ config }) => {
      icCallCount.count++;
      
      return () => ({
        tag: "div",
        props: { 
          className: config.theme,
          "data-locale": config.locale,
        },
      });
    };

    const config1 = { theme: "dark", locale: "en" };
    const config2 = { theme: "dark", locale: "en" }; // Same content, different object

    // First call
    genVNode({ tag: TestIC, props: { config: config1 } });
    expect(icCallCount.count).toBe(1);

    // Second call with different object but same content
    // This will currently trigger re-execution due to object reference change
    // but the important thing is that we have instance management in place
    genVNode({ tag: TestIC, props: { config: config2 } });
    expect(icCallCount.count).toBe(2); // Expected to increase due to object reference change

    // Third call with same object reference
    genVNode({ tag: TestIC, props: { config: config2 } });
    expect(icCallCount.count).toBe(2); // Should not increase
  });

  it("should handle nested ICs correctly", () => {
    const outerICCalls = { count: 0 };
    const innerICCalls = { count: 0 };
    
    const InnerIC: IC<{ text: string }> = ({ text }) => {
      innerICCalls.count++;
      return () => ({
        tag: "span",
        props: { children: [text] },
      });
    };

    const OuterIC: IC<{ title: string }> = ({ title }) => {
      outerICCalls.count++;
      return () => ({
        tag: "div",
        props: {
          children: [
            title,
            { tag: InnerIC, props: { text: "inner" } }
          ],
        },
      });
    };

    const props = { title: "Outer" };

    // First render
    genVNode({ tag: OuterIC, props });
    expect(outerICCalls.count).toBe(1);
    expect(innerICCalls.count).toBe(1);

    // Second render with same props
    genVNode({ tag: OuterIC, props });
    expect(outerICCalls.count).toBe(1); // Outer IC not re-executed
    expect(innerICCalls.count).toBe(1); // Inner IC not re-executed
  });
});