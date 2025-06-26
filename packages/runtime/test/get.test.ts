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
  getSlots,
  setCurrentCustomElementInstance,
} from "../src/functionalCustomElement/get";

describe("instance accessor functions", () => {
  beforeEach(() => {
    // Clear any existing context before each test
    vi.clearAllMocks();
  });

  describe("getHost", () => {
    it("should return the current instance when set", () => {
      const mockElement = document.createElement("div") as HTMLElement;

      setCurrentCustomElementInstance(mockElement);

      const result = getHost();
      expect(result).toBe(mockElement);
    });

    it("should return null and warn when no instance is set", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      setCurrentCustomElementInstance(null);

      const result = getHost();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "getHost: No custom element instance found. Make sure to call getHost during component execution.",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getShadowRoot", () => {
    it("should return shadowRoot when instance has one", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      // Mock shadowRoot property
      Object.defineProperty(mockElement, "shadowRoot", {
        value: { mode: "open" },
        writable: true,
      });

      setCurrentCustomElementInstance(mockElement);

      const result = getShadowRoot();
      expect(result).toEqual({ mode: "open" });
    });

    it("should return null when instance has no shadowRoot", () => {
      const mockElement = document.createElement("div") as HTMLElement;

      setCurrentCustomElementInstance(mockElement);

      const result = getShadowRoot();
      expect(result).toBeNull();
    });

    it("should warn when no instance is set", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      setCurrentCustomElementInstance(null);

      const result = getShadowRoot();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "getShadowRoot: No custom element instance found. Make sure to call getShadowRoot during component execution.",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getInternals", () => {
    it("should return cached internals when formAssociated is enabled", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      const mockInternals = { setFormValue: vi.fn() };

      // Mock constructor with formAssociated
      (mockElement.constructor as any).formAssociated = true;

      // Mock attachInternals method
      (mockElement as any).attachInternals = vi.fn().mockReturnValue(mockInternals);

      setCurrentCustomElementInstance(mockElement);

      const result1 = getInternals();
      const result2 = getInternals();

      expect(result1).toBe(mockInternals);
      expect(result2).toBe(mockInternals);
      // Should only call attachInternals once due to caching
      expect((mockElement as any).attachInternals).toHaveBeenCalledTimes(1);
    });

    it("should return null when formAssociated is not enabled", () => {
      const mockElement = document.createElement("div") as HTMLElement;

      // Ensure formAssociated is false
      (mockElement.constructor as any).formAssociated = false;

      setCurrentCustomElementInstance(mockElement);

      const result = getInternals();
      expect(result).toBeNull();
    });

    it("should return null when attachInternals is not available", () => {
      const mockElement = document.createElement("div") as HTMLElement;

      // Enable formAssociated but remove attachInternals
      (mockElement.constructor as any).formAssociated = true;
      // Explicitly remove attachInternals
      delete (mockElement as any).attachInternals;

      setCurrentCustomElementInstance(mockElement);

      const result = getInternals();
      expect(result).toBeNull();
    });

    it("should warn when no instance is set", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      setCurrentCustomElementInstance(null);

      const result = getInternals();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "getInternals: No custom element instance found. Make sure to call getInternals during component execution.",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getSlots", () => {
    it("should return array of default slots when no name is provided", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      const mockShadowRoot = document.createElement("div");
      const mockSlot1 = document.createElement("slot") as HTMLSlotElement;
      const mockSlot2 = document.createElement("slot") as HTMLSlotElement;

      // Setup shadow root with default slots
      mockShadowRoot.appendChild(mockSlot1);
      mockShadowRoot.appendChild(mockSlot2);
      Object.defineProperty(mockElement, "shadowRoot", {
        value: mockShadowRoot,
        writable: true,
      });

      // Mock querySelectorAll to return our slots
      mockShadowRoot.querySelectorAll = vi.fn().mockReturnValue([mockSlot1, mockSlot2]);

      setCurrentCustomElementInstance(mockElement);

      const result = getSlots();

      expect(result).toEqual([mockSlot1, mockSlot2]);
      expect(mockShadowRoot.querySelectorAll).toHaveBeenCalledWith("slot");
    });

    it("should return array of named slots when name is provided", () => {
      const mockElement = document.createElement("div") as HTMLElement;
      const mockShadowRoot = document.createElement("div");
      const mockSlot = document.createElement("slot") as HTMLSlotElement;

      // Setup shadow root with named slot
      mockShadowRoot.appendChild(mockSlot);
      Object.defineProperty(mockElement, "shadowRoot", {
        value: mockShadowRoot,
        writable: true,
      });

      // Mock querySelectorAll to return our slot
      mockShadowRoot.querySelectorAll = vi.fn().mockReturnValue([mockSlot]);

      setCurrentCustomElementInstance(mockElement);

      const result = getSlots("header");

      expect(result).toEqual([mockSlot]);
      expect(mockShadowRoot.querySelectorAll).toHaveBeenCalledWith("slot[name=\"header\"]");
    });

    it("should return empty array and warn when slot is not found", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mockElement = document.createElement("div") as HTMLElement;
      const mockShadowRoot = document.createElement("div");

      Object.defineProperty(mockElement, "shadowRoot", {
        value: mockShadowRoot,
        writable: true,
      });

      // Mock querySelectorAll to return empty NodeList
      mockShadowRoot.querySelectorAll = vi.fn().mockReturnValue([]);

      setCurrentCustomElementInstance(mockElement);

      const result = getSlots();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith("getSlots: No slot found.");

      consoleSpy.mockRestore();
    });

    it("should return empty array and warn when named slot is not found", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mockElement = document.createElement("div") as HTMLElement;
      const mockShadowRoot = document.createElement("div");

      Object.defineProperty(mockElement, "shadowRoot", {
        value: mockShadowRoot,
        writable: true,
      });

      // Mock querySelectorAll to return empty NodeList
      mockShadowRoot.querySelectorAll = vi.fn().mockReturnValue([]);

      setCurrentCustomElementInstance(mockElement);

      const result = getSlots("nonexistent");

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith("getSlots: No slot found with name \"nonexistent\".");

      consoleSpy.mockRestore();
    });

    it("should warn when no host element is found", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      setCurrentCustomElementInstance(null);

      const result = getSlots();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "getSlots: No host element found. Make sure to call getSlots during component execution.",
      );

      consoleSpy.mockRestore();
    });

    it("should return empty array when host has no shadowRoot", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mockElement = document.createElement("div") as HTMLElement;

      // Ensure shadowRoot is null
      Object.defineProperty(mockElement, "shadowRoot", {
        value: null,
        writable: true,
      });

      setCurrentCustomElementInstance(mockElement);

      const result = getSlots();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith("getSlots: No slot found.");

      consoleSpy.mockRestore();
    });
  });

  describe("integration tests", () => {
    it("should handle instance management correctly", () => {
      const mockInstance = document.createElement("div") as HTMLElement;

      // Test instance management
      setCurrentCustomElementInstance(mockInstance);
      const host = getHost();

      expect(host).toBe(mockInstance);

      // Clear instance
      setCurrentCustomElementInstance(null);
      const hostAfterClear = getHost();

      expect(hostAfterClear).toBeNull();
    });

    it("should handle multiple instance switches", () => {
      const mockInstance1 = document.createElement("div") as HTMLElement;
      const mockInstance2 = document.createElement("span") as HTMLElement;

      // Set first instance
      setCurrentCustomElementInstance(mockInstance1);
      expect(getHost()).toBe(mockInstance1);

      // Switch to second instance
      setCurrentCustomElementInstance(mockInstance2);
      expect(getHost()).toBe(mockInstance2);

      // Clear
      setCurrentCustomElementInstance(null);
      expect(getHost()).toBeNull();
    });
  });
});
