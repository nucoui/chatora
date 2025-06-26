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
      expect((MockConstructor as any).prototype.handleConnected).toBe(callback);
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

    it("should handle multiple connected callbacks by overwriting", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onConnected(callback1);
      onConnected(callback2);

      // The last callback should overwrite the previous one
      expect((MockConstructor as any).prototype.handleConnected).toBe(callback2);
    });
  });

  describe("onDisconnected", () => {
    it("should register disconnected callback when context is set", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onDisconnected(callback);

      expect((MockConstructor as any).prototype.handleDisconnected).toBeDefined();
      expect((MockConstructor as any).prototype.handleDisconnected).toBe(callback);
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

    it("should handle multiple disconnected callbacks by overwriting", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onDisconnected(callback1);
      onDisconnected(callback2);

      expect((MockConstructor as any).prototype.handleDisconnected).toBe(callback2);
    });
  });

  describe("onAttributeChanged", () => {
    it("should register attribute changed callback when context is set", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onAttributeChanged(callback);

      expect((MockConstructor as any).prototype.handleAttributeChanged).toBeDefined();
      expect((MockConstructor as any).prototype.handleAttributeChanged).toBe(callback);
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

    it("should handle multiple attribute changed callbacks by overwriting", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onAttributeChanged(callback1);
      onAttributeChanged(callback2);

      expect((MockConstructor as any).prototype.handleAttributeChanged).toBe(callback2);
    });
  });

  describe("onAdopted", () => {
    it("should register adopted callback when context is set", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onAdopted(callback);

      expect((MockConstructor as any).prototype.handleAdopted).toBeDefined();
      expect((MockConstructor as any).prototype.handleAdopted).toBe(callback);
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

    it("should handle multiple adopted callbacks by overwriting", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      setCurrentCustomElementContext(MockConstructor);

      onAdopted(callback1);
      onAdopted(callback2);

      expect((MockConstructor as any).prototype.handleAdopted).toBe(callback2);
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

      expect((MockConstructor1 as any).prototype.handleConnected).toBe(callback1);
      expect((MockConstructor2 as any).prototype.handleConnected).toBe(callback2);
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

      expect((MockConstructor as any).prototype.handleConnected).toBe(connectedCb);
      expect((MockConstructor as any).prototype.handleDisconnected).toBe(disconnectedCb);
      expect((MockConstructor as any).prototype.handleAttributeChanged).toBe(attributeChangedCb);
      expect((MockConstructor as any).prototype.handleAdopted).toBe(adoptedCb);
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
