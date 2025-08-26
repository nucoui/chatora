/**
 * Test IC lifecycle functionality
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { genVNode } from "../src/methods/core/vNode";
import {
  clearAllICInstances,
  getCurrentICInstance,
  onICConnected,
  onICDisconnected,
  onICAttributeChanged,
  onICAdopted,
} from "../src/methods/core/icInstance";
import type { IC } from "../src/main";

describe("IC Lifecycle Management", () => {
  beforeEach(() => {
    // Clear instances before each test
    clearAllICInstances();
    vi.clearAllMocks();
  });

  describe("IC Instance Caching", () => {
    it("should cache IC instances and reuse them for same props", () => {
      const renderCallCount = { count: 0 };
      
      const TestIC: IC<{ value: string }> = ({ value }) => {
        renderCallCount.count++;
        return () => ({
          tag: "div",
          props: { children: [value] },
        });
      };

      const props1 = { value: "test" };
      const props2 = { value: "test" }; // Same value

      // First call should create instance
      const vNode1 = genVNode({ tag: TestIC, props: props1 });
      expect(renderCallCount.count).toBe(1);
      expect(vNode1.tag).toBe("div");

      // Second call with same props should reuse instance
      const vNode2 = genVNode({ tag: TestIC, props: props2 });
      expect(renderCallCount.count).toBe(1); // Should not increase
      expect(vNode2.tag).toBe("div");
    });

    it("should create new instance when props change", () => {
      const renderCallCount = { count: 0 };
      
      const TestIC: IC<{ value: string }> = ({ value }) => {
        renderCallCount.count++;
        return () => ({
          tag: "div",
          props: { children: [value] },
        });
      };

      const props1 = { value: "test1" };
      const props2 = { value: "test2" }; // Different value

      // First call
      genVNode({ tag: TestIC, props: props1 });
      expect(renderCallCount.count).toBe(1);

      // Second call with different props should recreate
      genVNode({ tag: TestIC, props: props2 });
      expect(renderCallCount.count).toBe(2);
    });
  });

  describe("IC Lifecycle Hooks", () => {
    it("should allow IC to register lifecycle callbacks", () => {
      const connectedCallback = vi.fn();
      const disconnectedCallback = vi.fn();
      
      const TestIC: IC<{}> = () => {
        onICConnected(connectedCallback);
        onICDisconnected(disconnectedCallback);
        
        return () => ({
          tag: "div",
          props: {},
        });
      };

      // Create the IC instance
      genVNode({ tag: TestIC, props: {} });

      // The callbacks should be registered (we can't easily test the execution here
      // without a full DOM setup, but we can verify registration doesn't throw)
      expect(connectedCallback).not.toHaveBeenCalled(); // Not called during registration
      expect(disconnectedCallback).not.toHaveBeenCalled();
    });

    it("should get current IC instance context during component execution", () => {
      let capturedInstance: any = null;
      
      const TestIC: IC<{}> = () => {
        capturedInstance = getCurrentICInstance();
        return () => ({
          tag: "div",
          props: {},
        });
      };

      genVNode({ tag: TestIC, props: {} });

      expect(capturedInstance).not.toBeNull();
      expect(capturedInstance.getIsConnected).toBeDefined();
    });

    it("should allow multiple lifecycle callback registrations", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();
      
      const TestIC: IC<{}> = () => {
        onICConnected(callback1);
        onICConnected(callback2);
        onICDisconnected(callback3);
        
        return () => ({
          tag: "div",
          props: {},
        });
      };

      // Should not throw when registering multiple callbacks
      expect(() => {
        genVNode({ tag: TestIC, props: {} });
      }).not.toThrow();
    });

    it("should support attribute changed callbacks", () => {
      const attributeChangedCallback = vi.fn();
      
      const TestIC: IC<{}> = () => {
        onICAttributeChanged(attributeChangedCallback);
        
        return () => ({
          tag: "div",
          props: {},
        });
      };

      expect(() => {
        genVNode({ tag: TestIC, props: {} });
      }).not.toThrow();
    });

    it("should support adopted callbacks", () => {
      const adoptedCallback = vi.fn();
      
      const TestIC: IC<{}> = () => {
        onICAdopted(adoptedCallback);
        
        return () => ({
          tag: "div",
          props: {},
        });
      };

      expect(() => {
        genVNode({ tag: TestIC, props: {} });
      }).not.toThrow();
    });
  });

  describe("IC Context Management", () => {
    it("should return null when no IC context is active", () => {
      const instance = getCurrentICInstance();
      expect(instance).toBeNull();
    });

    it("should handle nested IC components correctly", () => {
      const outerInstance: any[] = [];
      const innerInstance: any[] = [];
      
      const InnerIC: IC<{}> = () => {
        innerInstance.push(getCurrentICInstance());
        return () => ({
          tag: "span",
          props: {},
        });
      };

      const OuterIC: IC<{}> = () => {
        outerInstance.push(getCurrentICInstance());
        
        return () => ({
          tag: "div",
          props: {
            children: [{ tag: InnerIC, props: {} }],
          },
        });
      };

      genVNode({ tag: OuterIC, props: {} });

      expect(outerInstance.length).toBe(1);
      expect(innerInstance.length).toBe(1);
      expect(outerInstance[0]).not.toBe(innerInstance[0]);
      expect(outerInstance[0]).not.toBeNull();
      expect(innerInstance[0]).not.toBeNull();
    });
  });

  describe("IC Lifecycle State Management", () => {
    it("should track connected state correctly", async () => {
      let instance: any = null;
      
      const TestIC: IC<{}> = () => {
        instance = getCurrentICInstance();
        return () => ({
          tag: "div",
          props: {},
        });
      };

      genVNode({ tag: TestIC, props: {} });

      expect(instance).not.toBeNull();
      expect(instance.getIsConnected()).toBe(false);

      // Simulate connect
      await instance.connect();
      expect(instance.getIsConnected()).toBe(true);

      // Simulate disconnect
      await instance.disconnect();
      expect(instance.getIsConnected()).toBe(false);
    });

    it("should execute connected callbacks when connected", async () => {
      const connectedCallback = vi.fn();
      let instance: any = null;
      
      const TestIC: IC<{}> = () => {
        instance = getCurrentICInstance();
        onICConnected(connectedCallback);
        return () => ({
          tag: "div",
          props: {},
        });
      };

      genVNode({ tag: TestIC, props: {} });

      expect(connectedCallback).not.toHaveBeenCalled();

      await instance.connect();
      expect(connectedCallback).toHaveBeenCalledTimes(1);

      // Connecting again should not call callback again
      await instance.connect();
      expect(connectedCallback).toHaveBeenCalledTimes(1);
    });

    it("should execute disconnected callbacks when disconnected", async () => {
      const disconnectedCallback = vi.fn();
      let instance: any = null;
      
      const TestIC: IC<{}> = () => {
        instance = getCurrentICInstance();
        onICDisconnected(disconnectedCallback);
        return () => ({
          tag: "div",
          props: {},
        });
      };

      genVNode({ tag: TestIC, props: {} });

      expect(disconnectedCallback).not.toHaveBeenCalled();

      // Must connect first
      await instance.connect();
      expect(disconnectedCallback).not.toHaveBeenCalled();

      await instance.disconnect();
      expect(disconnectedCallback).toHaveBeenCalledTimes(1);

      // Disconnecting again should not call callback again
      await instance.disconnect();
      expect(disconnectedCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling", () => {
    it("should handle errors in lifecycle callbacks gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const goodCallback = vi.fn();
      const errorCallback = vi.fn(() => {
        throw new Error("Test error");
      });
      let instance: any = null;
      
      const TestIC: IC<{}> = () => {
        instance = getCurrentICInstance();
        onICConnected(errorCallback);
        onICConnected(goodCallback);
        return () => ({
          tag: "div",
          props: {},
        });
      };

      genVNode({ tag: TestIC, props: {} });

      await instance.connect();

      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(goodCallback).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error in IC onConnected callback:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});