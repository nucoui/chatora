/**
 * lifecycle functions tests
 *
 * Tests for component lifecycle functions
 */
import { describe, expect, it, vi } from "vitest";

import { onAdopted, onAttributeChangedBase, onConnectedBase, onDisconnectedBase } from "../src/functionalCustomElement/on";

describe("lifecycle functions", () => {
  describe("onConnectedBase", () => {
    it("should register connected callback", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      onConnectedBase(callback, MockConstructor);

      // Check if the callback was registered
      expect((MockConstructor as any).prototype.handleConnected).toBeDefined();
      expect((MockConstructor as any).prototype.handleConnected).toBe(callback);
    });

    it("should handle multiple connected callbacks by overwriting", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      onConnectedBase(callback1, MockConstructor);
      onConnectedBase(callback2, MockConstructor);

      // The last callback should overwrite the previous one
      expect((MockConstructor as any).prototype.handleConnected).toBe(callback2);
    });

    it("should set callback directly on prototype", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      onConnectedBase(callback, MockConstructor);

      expect((MockConstructor as any).prototype.handleConnected).toBeDefined();
      expect(typeof (MockConstructor as any).prototype.handleConnected).toBe("function");
    });
  });

  describe("onDisconnectedBase", () => {
    it("should register disconnected callback", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      onDisconnectedBase(callback, MockConstructor);

      expect((MockConstructor as any).prototype.handleDisconnected).toBeDefined();
      expect((MockConstructor as any).prototype.handleDisconnected).toBe(callback);
    });

    it("should handle multiple disconnected callbacks by overwriting", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      onDisconnectedBase(callback1, MockConstructor);
      onDisconnectedBase(callback2, MockConstructor);

      expect((MockConstructor as any).prototype.handleDisconnected).toBe(callback2);
    });
  });

  describe("onAttributeChangedBase", () => {
    it("should register attribute changed callback", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      onAttributeChangedBase(callback, MockConstructor);

      expect((MockConstructor as any).prototype.handleAttributeChanged).toBeDefined();
      expect((MockConstructor as any).prototype.handleAttributeChanged).toBe(callback);
    });

    it("should handle multiple attribute changed callbacks by overwriting", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      onAttributeChangedBase(callback1, MockConstructor);
      onAttributeChangedBase(callback2, MockConstructor);

      expect((MockConstructor as any).prototype.handleAttributeChanged).toBe(callback2);
    });
  });

  describe("onAdopted", () => {
    it("should register adopted callback", () => {
      const callback = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      onAdopted(callback, MockConstructor);

      expect((MockConstructor as any).prototype.handleAdopted).toBeDefined();
      expect((MockConstructor as any).prototype.handleAdopted).toBe(callback);
    });

    it("should handle multiple adopted callbacks by overwriting", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      onAdopted(callback1, MockConstructor);
      onAdopted(callback2, MockConstructor);

      expect((MockConstructor as any).prototype.handleAdopted).toBe(callback2);
    });
  });

  describe("integration tests", () => {
    it("should work with different constructors independently", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const MockConstructor1 = class extends HTMLElement {};
      const MockConstructor2 = class extends HTMLElement {};

      onConnectedBase(callback1, MockConstructor1);
      onConnectedBase(callback2, MockConstructor2);

      expect((MockConstructor1 as any).prototype.handleConnected).toBe(callback1);
      expect((MockConstructor2 as any).prototype.handleConnected).toBe(callback2);
    });

    it("should handle all lifecycle types on same constructor", () => {
      const connectedCb = vi.fn();
      const disconnectedCb = vi.fn();
      const attributeChangedCb = vi.fn();
      const adoptedCb = vi.fn();
      const MockConstructor = class extends HTMLElement {};

      onConnectedBase(connectedCb, MockConstructor);
      onDisconnectedBase(disconnectedCb, MockConstructor);
      onAttributeChangedBase(attributeChangedCb, MockConstructor);
      onAdopted(adoptedCb, MockConstructor);

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

      onConnectedBase(callback, MockConstructor);

      expect((MockConstructor as any).prototype.handleConnected).toBeDefined();
      expect((MockConstructor as any).prototype.existingMethod).toBeDefined();
      const instance = new MockConstructor();
      expect(instance.existingMethod()).toBe("existing");
    });
  });
});
