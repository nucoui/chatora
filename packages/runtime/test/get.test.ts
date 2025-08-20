/**
 * Instance accessor functions tests
 *
 * Tests for component instance accessor functions
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getHost,
  getInternals,
  getShadowRoot,
  getSlotteds,
  setCurrentCustomElementInstance,
} from "../src/methods/core/get";
import { setCurrentCustomElementContext } from "../src/methods/core/on";

describe("instance accessor functions", () => {
  beforeEach(() => {
    // Clear any existing context before each test
    setCurrentCustomElementInstance(null);
    setCurrentCustomElementContext(null);
  });

  describe("getHost", () => {
    it("should return signal that initially has null value but can be accessed via .value and .run", () => {
      const mockElement = document.createElement("div") as HTMLElement;

      setCurrentCustomElementInstance(mockElement);

      const hostSignal = getHost();

      // The signal should have value and run properties
      expect(hostSignal).toHaveProperty("value");
      expect(hostSignal).toHaveProperty("run");

      // Initially the value should be null until onConnected is called
      // This is because the signal is only updated in the onConnected callback
      expect(hostSignal.value).toBeNull();
      expect(hostSignal.run()).toBeNull();
    });

    it("should return signal with null value when no instance is set", () => {
      setCurrentCustomElementInstance(null);
      const hostSignal = getHost();
      expect(hostSignal.value).toBeNull();
      expect(hostSignal.run()).toBeNull();
    });
  });

  describe("getShadowRoot", () => {
    it("should return signal that initially has null value when instance is set", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      // Mock shadowRoot property
      Object.defineProperty(mockElement, "shadowRoot", {
        value: { mode: "open" },
        writable: true,
      });

      setCurrentCustomElementInstance(mockElement);

      const shadowRootSignal = getShadowRoot();

      // Initially null until onConnected is called
      expect(shadowRootSignal.value).toBeNull();
      expect(shadowRootSignal.run()).toBeNull();
    });

    it("should return signal that provides null when instance has no shadowRoot", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      setCurrentCustomElementInstance(mockElement);

      const shadowRootSignal = getShadowRoot();

      expect(shadowRootSignal.value).toBeNull();
      expect(shadowRootSignal.run()).toBeNull();
    });

    it("should return signal with null value when no instance is set", () => {
      setCurrentCustomElementInstance(null);
      const shadowRootSignal = getShadowRoot();
      expect(shadowRootSignal.value).toBeNull();
      expect(shadowRootSignal.run()).toBeNull();
    });
  });

  describe("getInternals", () => {
    it("should return signal that initially provides null even when formAssociated is enabled", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      const mockInternals = { setFormValue: vi.fn() };

      // Mock constructor with formAssociated
      (mockElement.constructor as any).formAssociated = true;

      // Mock attachInternals method
      (mockElement as any).attachInternals = vi.fn().mockReturnValue(mockInternals);

      setCurrentCustomElementInstance(mockElement);

      const internalsSignal = getInternals();

      // Initially null until onConnected is called
      expect(internalsSignal.value).toBeNull();
      expect(internalsSignal.run()).toBeNull();
    });

    it("should return signal that provides null when formAssociated is not enabled", () => {
      const mockElement = document.createElement("div") as HTMLElement;

      // Ensure formAssociated is false
      (mockElement.constructor as any).formAssociated = false;

      setCurrentCustomElementInstance(mockElement);

      const internalsSignal = getInternals();

      expect(internalsSignal.value).toBeNull();
      expect(internalsSignal.run()).toBeNull();
    });

    it("should return signal that provides null when attachInternals is not available", () => {
      const mockElement = document.createElement("div") as HTMLElement;

      // Enable formAssociated but remove attachInternals
      (mockElement.constructor as any).formAssociated = true;
      // Explicitly remove attachInternals
      delete (mockElement as any).attachInternals;

      setCurrentCustomElementInstance(mockElement);

      const internalsSignal = getInternals();

      expect(internalsSignal.value).toBeNull();
      expect(internalsSignal.run()).toBeNull();
    });

    it("should return signal with null value when no instance is set", () => {
      setCurrentCustomElementInstance(null);
      const internalsSignal = getInternals();
      expect(internalsSignal.value).toBeNull();
      expect(internalsSignal.run()).toBeNull();
    });
  });

  describe("getSlotteds", () => {
    it("should return signal that initially provides null until onConnected is called", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      const mockChild1 = document.createElement("span");
      const mockChild2 = document.createElement("p");
      const mockSlottedChild = document.createElement("div");
      mockSlottedChild.setAttribute("slot", "named");

      // Add children to host element
      mockElement.appendChild(mockChild1);
      mockElement.appendChild(mockChild2);
      mockElement.appendChild(mockSlottedChild);

      setCurrentCustomElementInstance(mockElement);

      const slottedSignal = getSlotteds();

      // Initially null until onConnected callback is executed
      expect(slottedSignal.value).toBeNull();
      expect(slottedSignal.run()).toBeNull();
    });

    it("should return signal that initially provides null for named slots", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      const mockNamedChild = document.createElement("span");
      const mockDefaultChild = document.createElement("p");

      mockNamedChild.setAttribute("slot", "header");
      mockElement.appendChild(mockNamedChild);
      mockElement.appendChild(mockDefaultChild);

      setCurrentCustomElementInstance(mockElement);

      const slottedSignal = getSlotteds("header");

      expect(slottedSignal.value).toBeNull();
      expect(slottedSignal.run()).toBeNull();
    });

    it("should return signal that initially provides null for empty slots", () => {
      const mockElement = document.createElement("div") as HTMLElement;

      setCurrentCustomElementInstance(mockElement);

      const slottedSignal = getSlotteds();

      expect(slottedSignal.value).toBeNull();
      expect(slottedSignal.run()).toBeNull();
    });

    it("should return signal with null value when no host element is found", () => {
      setCurrentCustomElementInstance(null);
      const slottedSignal = getSlotteds();
      expect(slottedSignal.value).toBeNull();
      expect(slottedSignal.run()).toBeNull();
    });
  });

  describe("integration tests", () => {
    it("should handle instance management correctly", () => {
      const mockInstance = document.createElement("div") as HTMLElement;
      // Test instance management
      setCurrentCustomElementInstance(mockInstance);
      const hostSignal = getHost();
      // Initially null until onConnected is executed
      expect(hostSignal.value).toBeNull();
      expect(hostSignal.run()).toBeNull();
      // Clear instance
      setCurrentCustomElementInstance(null);
      const hostAfterClearSignal = getHost();
      expect(hostAfterClearSignal.value).toBeNull();
      expect(hostAfterClearSignal.run()).toBeNull();
    });

    it("should handle multiple instance switches", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mockInstance1 = document.createElement("div") as HTMLElement;
      const mockInstance2 = document.createElement("span") as HTMLElement;

      // Set first instance
      setCurrentCustomElementInstance(mockInstance1);
      const host1Signal = getHost();

      // Initially null until onConnected is executed
      expect(host1Signal.value).toBeNull();
      expect(host1Signal.run()).toBeNull();

      // Switch to second instance
      setCurrentCustomElementInstance(mockInstance2);
      const host2Signal = getHost();

      // Initially null until onConnected is executed
      expect(host2Signal.value).toBeNull();
      expect(host2Signal.run()).toBeNull();

      // Clear
      setCurrentCustomElementInstance(null);
      const hostClearedSignal = getHost();
      expect(hostClearedSignal.value).toBeNull();
      expect(hostClearedSignal.run()).toBeNull();

      consoleSpy.mockRestore();
    });
  });
});
