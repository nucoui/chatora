import type { Computed, Effect, Signal } from "../src/main";
import { describe, expect, it } from "vitest";
import { computed, effect, endBatch, signal, startBatch } from "../src/main";

describe("custom Reactive API", () => {
  it("signal should hold and update values", () => {
    const [count, setCount] = signal(1);
    expect(count()).toBe(1);

    setCount(2);
    expect(count()).toBe(2);
  });

  it("signal should support updater functions", () => {
    const [count, setCount] = signal(0);
    expect(count()).toBe(0);

    setCount(prev => prev + 1);
    expect(count()).toBe(1);

    // Multiple updates
    setCount(prev => prev + 5);
    expect(count()).toBe(6);
  });

  it("computed should derive values reactively", () => {
    const [count, setCount] = signal(1);
    const doubleCount = computed(() => count() * 2);

    expect(doubleCount()).toBe(2);

    setCount(3);
    expect(doubleCount()).toBe(6);
  });

  it("effect should react to signal changes", () => {
    const [count, setCount] = signal(1);
    let log = 0;

    effect(({ isFirstExecution }) => {
      const value = count();

      if (isFirstExecution)
        return;

      log = value;
    });

    expect(log).toBe(0);

    setCount(5);
    expect(log).toBe(5);
  });

  it("effect should not run if no dependencies change", () => {
    const [count, setCount] = signal(1);
    let log = 0;

    effect(() => {
      count();
      log++;
    });

    expect(log).toBe(1); // Initial run

    setCount(1); // No change
    expect(log).toBe(1); // Should not increment
  });

  it("startBatch and endBatch should batch updates", () => {
    const [count, setCount] = signal(0);
    let effectCount = 0;

    effect(() => {
      count();
      effectCount++;
    });

    // Reset after initial effect
    effectCount = 0;

    // Without batching, each update triggers the effect
    setCount(1);
    setCount(2);
    expect(effectCount).toBe(2);

    // With batching, updates are combined
    effectCount = 0;
    startBatch();
    setCount(3);
    setCount(4);
    setCount(5);
    expect(effectCount).toBe(0); // No effects yet
    endBatch();
    expect(effectCount).toBe(1); // Only one effect after batch
    expect(count()).toBe(5);
  });

  it("should properly type Signal, Computed, and Effect", () => {
    // Verify Signal type works
    const counter: Signal<number> = signal(0);
    expect(typeof counter[0]).toBe("function");
    expect(typeof counter[1]).toBe("function");

    // Verify Computed type works
    const double: Computed<number> = computed(() => counter[0]() * 2);
    expect(typeof double).toBe("function");

    // Verify Effect type works
    const cleanup: Effect = effect(() => {
      counter[0](); // Access the signal
    });
    expect(typeof cleanup).toBe("function");
  });
});
