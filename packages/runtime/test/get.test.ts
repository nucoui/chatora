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
} from "../src/functionalCustomElement/get";
import { onConnected } from "../src/functionalCustomElement/on";

// Mock onConnected function
vi.mock("../src/functionalCustomElement/on", () => ({
  onConnected: vi.fn(),
  onDisconnected: vi.fn(),
  onAttributeChanged: vi.fn(),
  onAdopted: vi.fn(),
  setCurrentCustomElementContext: vi.fn(),
}));

const mockOnConnected = vi.mocked(onConnected);

describe("instance accessor functions", () => {
  beforeEach(() => {
    // Clear any existing context before each test
    vi.clearAllMocks();
    mockOnConnected.mockReset();
  });

  describe("getHost", () => {
    it("should return signal that provides the current instance when set", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      setCurrentCustomElementInstance(mockElement);

      const signalGetter = getHost();

      // Execute the onConnected callback that was registered
      expect(mockOnConnected).toHaveBeenCalledTimes(1);
      const onConnectedCallback = mockOnConnected.mock.calls[0][0];
      onConnectedCallback();

      expect(signalGetter()).toBe(mockElement);
    });

    it("should return signal that provides null and warn when no instance is set", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      setCurrentCustomElementInstance(null);

      const signalGetter = getHost();

      expect(signalGetter()).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "getHost: No custom element instance found. Make sure to call getHost during component execution.",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getShadowRoot", () => {
    it("should return signal that provides shadowRoot when instance has one", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      // Mock shadowRoot property
      Object.defineProperty(mockElement, "shadowRoot", {
        value: { mode: "open" },
        writable: true,
      });

      setCurrentCustomElementInstance(mockElement);

      const signalGetter = getShadowRoot();

      // Execute the onConnected callback that was registered
      expect(mockOnConnected).toHaveBeenCalledTimes(1);
      const onConnectedCallback = mockOnConnected.mock.calls[0][0];
      onConnectedCallback();

      expect(signalGetter()).toEqual({ mode: "open" });
    });

    it("should return signal that provides null when instance has no shadowRoot", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      setCurrentCustomElementInstance(mockElement);

      const signalGetter = getShadowRoot();

      // Execute the onConnected callback that was registered
      const onConnectedCallback = mockOnConnected.mock.calls[0][0];
      onConnectedCallback();

      expect(signalGetter()).toBeNull();
    });

    it("should warn when no instance is set", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      setCurrentCustomElementInstance(null);

      const signalGetter = getShadowRoot();

      expect(signalGetter()).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "getShadowRoot: No custom element instance found. Make sure to call getShadowRoot during component execution.",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getInternals", () => {
    it("should return signal that provides cached internals when formAssociated is enabled", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      const mockInternals = { setFormValue: vi.fn() };

      // Mock constructor with formAssociated
      (mockElement.constructor as any).formAssociated = true;

      // Mock attachInternals method
      (mockElement as any).attachInternals = vi.fn().mockReturnValue(mockInternals);

      setCurrentCustomElementInstance(mockElement);

      const signalGetter1 = getInternals();
      const signalGetter2 = getInternals();

      // Execute the onConnected callbacks that were registered
      expect(mockOnConnected).toHaveBeenCalledTimes(2);
      const onConnectedCallback1 = mockOnConnected.mock.calls[0][0];
      const onConnectedCallback2 = mockOnConnected.mock.calls[1][0];
      onConnectedCallback1();
      onConnectedCallback2();

      expect(signalGetter1()).toBe(mockInternals);
      expect(signalGetter2()).toBe(mockInternals);
      // Should only call attachInternals once due to caching
      expect((mockElement as any).attachInternals).toHaveBeenCalledTimes(1);
    });

    it("should return signal that provides null when formAssociated is not enabled", () => {
      const mockElement = document.createElement("div") as HTMLElement;

      // Ensure formAssociated is false
      (mockElement.constructor as any).formAssociated = false;

      setCurrentCustomElementInstance(mockElement);

      const signalGetter = getInternals();

      // Execute the onConnected callback that was registered
      const onConnectedCallback = mockOnConnected.mock.calls[0][0];
      onConnectedCallback();

      expect(signalGetter()).toBeNull();
    });

    it("should return signal that provides null when attachInternals is not available", () => {
      const mockElement = document.createElement("div") as HTMLElement;

      // Enable formAssociated but remove attachInternals
      (mockElement.constructor as any).formAssociated = true;
      // Explicitly remove attachInternals
      delete (mockElement as any).attachInternals;

      setCurrentCustomElementInstance(mockElement);

      const signalGetter = getInternals();

      // Execute the onConnected callback that was registered
      const onConnectedCallback = mockOnConnected.mock.calls[0][0];
      onConnectedCallback();

      expect(signalGetter()).toBeNull();
    });

    it("should warn when no instance is set", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      setCurrentCustomElementInstance(null);

      const signalGetter = getInternals();

      expect(signalGetter()).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "getInternals: No custom element instance found. Make sure to call getInternals during component execution.",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getSlotteds", () => {
    it("should return signal that provides array of default slotted elements when no name is provided", () => {
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

      const signalGetter = getSlotteds();

      // Execute the onConnected callback that was registered
      const onConnectedCallback = mockOnConnected.mock.calls[0][0];
      onConnectedCallback();

      // Should return all children (implementation returns all children with :scope > *)
      expect(signalGetter()).toEqual([mockChild1, mockChild2, mockSlottedChild]);
    });

    it("should return signal that provides array of named slotted elements when name is provided", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      const mockNamedChild = document.createElement("span");
      const mockDefaultChild = document.createElement("p");

      mockNamedChild.setAttribute("slot", "header");
      mockElement.appendChild(mockNamedChild);
      mockElement.appendChild(mockDefaultChild);

      setCurrentCustomElementInstance(mockElement);

      const signalGetter = getSlotteds("header");

      // Execute the onConnected callback that was registered
      const onConnectedCallback = mockOnConnected.mock.calls[0][0];
      onConnectedCallback();

      expect(signalGetter()).toEqual([mockNamedChild]);
    });

    it("should return signal that provides empty array when no slotted elements are found", () => {
      const mockElement = document.createElement("div") as HTMLElement;

      setCurrentCustomElementInstance(mockElement);

      const signalGetter = getSlotteds();

      // Execute the onConnected callback that was registered
      const onConnectedCallback = mockOnConnected.mock.calls[0][0];
      onConnectedCallback();

      expect(signalGetter()).toEqual([]);
    });

    it("should warn when no host element is found", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      setCurrentCustomElementInstance(null);

      const signalGetter = getSlotteds();

      expect(signalGetter()).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "getSlotteds: No custom element instance found. Make sure to call getSlotteds during component execution.",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("integration tests", () => {
    it("should handle instance management correctly", () => {
      const mockInstance = document.createElement("div") as HTMLElement;

      // Test instance management
      setCurrentCustomElementInstance(mockInstance);
      const hostSignalGetter = getHost();

      // Execute the onConnected callback that was registered
      const onConnectedCallback = mockOnConnected.mock.calls[0][0];
      onConnectedCallback();

      expect(hostSignalGetter()).toBe(mockInstance);

      // Clear instance
      setCurrentCustomElementInstance(null);
      const hostAfterClearSignalGetter = getHost();

      expect(hostAfterClearSignalGetter()).toBeNull();
    });

    it("should handle multiple instance switches", () => {
      const mockInstance1 = document.createElement("div") as HTMLElement;
      const mockInstance2 = document.createElement("span") as HTMLElement;

      // Set first instance
      setCurrentCustomElementInstance(mockInstance1);
      const host1SignalGetter = getHost();

      // Execute the onConnected callback that was registered
      let onConnectedCallback = mockOnConnected.mock.calls[0][0];
      onConnectedCallback();
      expect(host1SignalGetter()).toBe(mockInstance1);

      // Switch to second instance
      setCurrentCustomElementInstance(mockInstance2);
      const host2SignalGetter = getHost();

      // Execute the onConnected callback that was registered
      onConnectedCallback = mockOnConnected.mock.calls[1][0];
      onConnectedCallback();
      expect(host2SignalGetter()).toBe(mockInstance2);

      // Clear
      setCurrentCustomElementInstance(null);
      const hostClearedSignalGetter = getHost();
      expect(hostClearedSignalGetter()).toBeNull();
    });
  });
});
