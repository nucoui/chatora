/**
 * lifecycle functions tests
 *
 * Tests for component lifecycle functions
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  onAdopted,
  onAttributeChanged,
  onConnected,
  onDisconnected,
  setCurrentCustomElementContext,
} from "../src/methods/core/on";

describe("lifecycle functions", () => {
  beforeEach(() => {
    // Clear any existing context before each test
    vi.clearAllMocks();
  });

  describe("onConnected", () => {
    it("should register connected callback when context is set", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      // Set the context as the genSD would
      setCurrentCustomElementContext(MockConstructor);

      onConnected(callback);

      // Check if the callback was registered
      expect((MockConstructor as any).prototype.handleConnected).toBeDefined();
      expect((MockConstructor as any).prototype.handleConnectedCallbacks).toEqual([callback]);
    });

    it("should not throw when no context is set", () => {
      const callback = vi.fn();
      setCurrentCustomElementContext(null);
      expect(() => onConnected(callback)).not.toThrow();
    });

    it("should handle multiple connected callbacks by storing all of them", async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onConnected(callback1);
      onConnected(callback2);
      onConnected(callback3);

      // All callbacks should be stored in the array
      expect((MockConstructor as any).prototype.handleConnectedCallbacks).toEqual([callback1, callback2, callback3]);

      // Test that all callbacks are executed when handleConnected is called
      // Create a mock instance with the prototype methods
      const mockInstance = {
        handleConnectedCallbacks: (MockConstructor as any).prototype.handleConnectedCallbacks,
        handleConnected: (MockConstructor as any).prototype.handleConnected,
      };
      await mockInstance.handleConnected();

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
      expect(callback3).toHaveBeenCalledOnce();
    });

    it("should execute all callbacks in registration order", async () => {
      const executionOrder: number[] = [];
      const callback1 = vi.fn(() => {
        executionOrder.push(1);
      });
      const callback2 = vi.fn(() => {
        executionOrder.push(2);
      });
      const callback3 = vi.fn(() => {
        executionOrder.push(3);
      });
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onConnected(callback1);
      onConnected(callback2);
      onConnected(callback3);

      const mockInstance = {
        handleConnectedCallbacks: (MockConstructor as any).prototype.handleConnectedCallbacks,
        handleConnected: (MockConstructor as any).prototype.handleConnected,
      };
      await mockInstance.handleConnected();

      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it("should handle mixed lifecycle callbacks with multiple registrations", async () => {
      const connectedCb1 = vi.fn();
      const connectedCb2 = vi.fn();
      const disconnectedCb1 = vi.fn();
      const disconnectedCb2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onConnected(connectedCb1);
      onDisconnected(disconnectedCb1);
      onConnected(connectedCb2);
      onDisconnected(disconnectedCb2);

      expect((MockConstructor as any).prototype.handleConnectedCallbacks).toEqual([connectedCb1, connectedCb2]);
      expect((MockConstructor as any).prototype.handleDisconnectedCallbacks).toEqual([disconnectedCb1, disconnectedCb2]);

      const mockInstance = {
        handleConnectedCallbacks: (MockConstructor as any).prototype.handleConnectedCallbacks,
        handleDisconnectedCallbacks: (MockConstructor as any).prototype.handleDisconnectedCallbacks,
        handleConnected: (MockConstructor as any).prototype.handleConnected,
        handleDisconnected: (MockConstructor as any).prototype.handleDisconnected,
      };

      await mockInstance.handleConnected();
      expect(connectedCb1).toHaveBeenCalledOnce();
      expect(connectedCb2).toHaveBeenCalledOnce();

      await mockInstance.handleDisconnected();
      expect(disconnectedCb1).toHaveBeenCalledOnce();
      expect(disconnectedCb2).toHaveBeenCalledOnce();
    });

    it("should handle error in one callback without affecting others", async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn(() => {
        throw new Error("Test error");
      });
      const callback3 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onConnected(callback1);
      onConnected(callback2);
      onConnected(callback3);

      const mockInstance = {
        handleConnectedCallbacks: (MockConstructor as any).prototype.handleConnectedCallbacks,
        handleConnected: (MockConstructor as any).prototype.handleConnected,
      };

      // Should not throw error since errors are caught and logged
      await expect(mockInstance.handleConnected()).resolves.toBeUndefined();
      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
      expect(callback3).toHaveBeenCalledOnce(); // callback3 should still be called
    });
  });

  describe("onDisconnected", () => {
    it("should register disconnected callback when context is set", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onDisconnected(callback);

      expect((MockConstructor as any).prototype.handleDisconnected).toBeDefined();
      expect((MockConstructor as any).prototype.handleDisconnectedCallbacks).toEqual([callback]);
    });

    it("should not throw when no context is set", () => {
      const callback = vi.fn();
      setCurrentCustomElementContext(null);
      expect(() => onDisconnected(callback)).not.toThrow();
    });

    it("should handle multiple disconnected callbacks by storing all of them", async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onDisconnected(callback1);
      onDisconnected(callback2);

      expect((MockConstructor as any).prototype.handleDisconnectedCallbacks).toEqual([callback1, callback2]);

      // Test that all callbacks are executed when handleDisconnected is called
      const mockInstance = {
        handleDisconnectedCallbacks: (MockConstructor as any).prototype.handleDisconnectedCallbacks,
        handleDisconnected: (MockConstructor as any).prototype.handleDisconnected,
      };
      await mockInstance.handleDisconnected();

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
    });
  });

  describe("onAttributeChanged", () => {
    it("should register attribute changed callback when context is set", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onAttributeChanged(callback);

      expect((MockConstructor as any).prototype.handleAttributeChanged).toBeDefined();
      expect((MockConstructor as any).prototype.handleAttributeChangedCallbacks).toEqual([callback]);
    });

    it("should not throw when no context is set", () => {
      const callback = vi.fn();
      setCurrentCustomElementContext(null);
      expect(() => onAttributeChanged(callback)).not.toThrow();
    });

    it("should handle multiple attribute changed callbacks by storing all of them", async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onAttributeChanged(callback1);
      onAttributeChanged(callback2);

      expect((MockConstructor as any).prototype.handleAttributeChangedCallbacks).toEqual([callback1, callback2]);

      // Test that all callbacks are executed when handleAttributeChanged is called
      const mockInstance = {
        handleAttributeChangedCallbacks: (MockConstructor as any).prototype.handleAttributeChangedCallbacks,
        handleAttributeChanged: (MockConstructor as any).prototype.handleAttributeChanged,
      };
      await mockInstance.handleAttributeChanged("test", "old", "new");

      expect(callback1).toHaveBeenCalledWith("test", "old", "new");
      expect(callback2).toHaveBeenCalledWith("test", "old", "new");
    });
  });

  describe("onAdopted", () => {
    it("should register adopted callback when context is set", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onAdopted(callback);

      expect((MockConstructor as any).prototype.handleAdopted).toBeDefined();
      expect((MockConstructor as any).prototype.handleAdoptedCallbacks).toEqual([callback]);
    });

    it("should not throw when no context is set", () => {
      const callback = vi.fn();
      setCurrentCustomElementContext(null);
      expect(() => onAdopted(callback)).not.toThrow();
    });

    it("should handle multiple adopted callbacks by storing all of them", async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onAdopted(callback1);
      onAdopted(callback2);

      expect((MockConstructor as any).prototype.handleAdoptedCallbacks).toEqual([callback1, callback2]);

      // Test that all callbacks are executed when handleAdopted is called
      const mockInstance = {
        handleAdoptedCallbacks: (MockConstructor as any).prototype.handleAdoptedCallbacks,
        handleAdopted: (MockConstructor as any).prototype.handleAdopted,
      };
      await mockInstance.handleAdopted();

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
    });
  });

  describe("integration tests", () => {
    it("should work with different constructors independently", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor1 = class extends HTMLElement {};
      const MockConstructor2 = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor1);
      onConnected(callback1);

      setCurrentCustomElementContext(MockConstructor2);
      onConnected(callback2);

      expect((MockConstructor1 as any).prototype.handleConnectedCallbacks).toEqual([callback1]);
      expect((MockConstructor2 as any).prototype.handleConnectedCallbacks).toEqual([callback2]);
    });

    it("should handle all lifecycle types on same constructor", () => {
      const connectedCb = vi.fn();
      const disconnectedCb = vi.fn();
      const attributeChangedCb = vi.fn();
      const adoptedCb = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onConnected(connectedCb);
      onDisconnected(disconnectedCb);
      onAttributeChanged(attributeChangedCb);
      onAdopted(adoptedCb);

      expect((MockConstructor as any).prototype.handleConnectedCallbacks).toEqual([connectedCb]);
      expect((MockConstructor as any).prototype.handleDisconnectedCallbacks).toEqual([disconnectedCb]);
      expect((MockConstructor as any).prototype.handleAttributeChangedCallbacks).toEqual([attributeChangedCb]);
      expect((MockConstructor as any).prototype.handleAdoptedCallbacks).toEqual([adoptedCb]);
    });

    it("should not interfere with existing properties", () => {
      const callback = vi.fn();
      const MockConstructor = class MockCustomElement {
        existingMethod() {
          return "existing";
        }
      };

      setCurrentCustomElementContext(MockConstructor);
      onConnected(callback);

      expect((MockConstructor as any).prototype.handleConnected).toBeDefined();
      expect((MockConstructor as any).prototype.existingMethod).toBeDefined();
      const instance = new MockConstructor();
      expect(instance.existingMethod()).toBe("existing");
    });
  });
});
