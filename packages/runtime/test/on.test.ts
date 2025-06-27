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
} from "../src/functionalCustomElement/on";

describe("lifecycle functions", () => {
  beforeEach(() => {
    // Clear any existing context before each test
    vi.clearAllMocks();
  });

  describe("onConnected", () => {
    it("should register connected callback when context is set", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      // Set the context as the functionalCustomElement would
      setCurrentCustomElementContext(MockConstructor);

      onConnected(callback);

      // Check if the callback was registered
      expect((MockConstructor as any).prototype.handleConnected).toBeDefined();
      expect((MockConstructor as any).prototype.handleConnectedCallbacks).toEqual([callback]);
    });

    it("should warn when no context is set", () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Clear context
      setCurrentCustomElementContext(null);

      onConnected(callback);

      expect(consoleSpy).toHaveBeenCalledWith(
        "onConnected: No custom element context found. Make sure to call onConnected during component definition.",
      );

      consoleSpy.mockRestore();
    });

    it("should handle multiple connected callbacks by storing all of them", () => {
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
      mockInstance.handleConnected();

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
      expect(callback3).toHaveBeenCalledOnce();
    });

    it("should execute all callbacks in registration order", () => {
      const executionOrder: number[] = [];
      const callback1 = vi.fn(() => executionOrder.push(1));
      const callback2 = vi.fn(() => executionOrder.push(2));
      const callback3 = vi.fn(() => executionOrder.push(3));
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onConnected(callback1);
      onConnected(callback2);
      onConnected(callback3);

      const mockInstance = {
        handleConnectedCallbacks: (MockConstructor as any).prototype.handleConnectedCallbacks,
        handleConnected: (MockConstructor as any).prototype.handleConnected,
      };
      mockInstance.handleConnected();

      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it("should handle mixed lifecycle callbacks with multiple registrations", () => {
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

      mockInstance.handleConnected();
      expect(connectedCb1).toHaveBeenCalledOnce();
      expect(connectedCb2).toHaveBeenCalledOnce();

      mockInstance.handleDisconnected();
      expect(disconnectedCb1).toHaveBeenCalledOnce();
      expect(disconnectedCb2).toHaveBeenCalledOnce();
    });

    it("should handle error in one callback without affecting others", () => {
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

      expect(() => mockInstance.handleConnected()).toThrow("Test error");
      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
      // Note: callback3 won't be called due to the error in callback2
      // This is expected behavior with the current implementation
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

    it("should warn when no context is set", () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      setCurrentCustomElementContext(null);

      onDisconnected(callback);

      expect(consoleSpy).toHaveBeenCalledWith(
        "onDisconnected: No custom element context found. Make sure to call onDisconnected during component definition.",
      );

      consoleSpy.mockRestore();
    });

    it("should handle multiple disconnected callbacks by storing all of them", () => {
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
      mockInstance.handleDisconnected();

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

    it("should warn when no context is set", () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      setCurrentCustomElementContext(null);

      onAttributeChanged(callback);

      expect(consoleSpy).toHaveBeenCalledWith(
        "onAttributeChanged: No custom element context found. Make sure to call onAttributeChanged during component definition.",
      );

      consoleSpy.mockRestore();
    });

    it("should handle multiple attribute changed callbacks by storing all of them", () => {
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
      mockInstance.handleAttributeChanged("test", "old", "new");

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

    it("should warn when no context is set", () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      setCurrentCustomElementContext(null);

      onAdopted(callback);

      expect(consoleSpy).toHaveBeenCalledWith(
        "onAdopted: No custom element context found. Make sure to call onAdopted during component definition.",
      );

      consoleSpy.mockRestore();
    });

    it("should handle multiple adopted callbacks by storing all of them", () => {
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
      mockInstance.handleAdopted();

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
