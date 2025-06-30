import { describe, expect, it } from "vitest";
import { computed, effect, endBatch, signal, startBatch } from "../src/main";

describe("custom Reactive API", () => {
  it("signal should hold and update values", () => {
    const count = signal(1);
    expect(count.value).toBe(1);

    count.set(2);
    expect(count.value).toBe(2);
  });

  it("signal should support updater functions", () => {
    const count = signal(0);
    expect(count.value).toBe(0);

    count.set(prev => prev + 1);
    expect(count.value).toBe(1);

    // Multiple updates
    count.set(prev => prev + 5);
    expect(count.value).toBe(6);
  });

  it("computed should derive values reactively", () => {
    const count = signal(1);
    const doubleCount = computed(() => count.value * 2);

    expect(doubleCount.value).toBe(2);

    count.set(3);
    expect(doubleCount.value).toBe(6);
  });

  it("effect should react to signal changes", () => {
    const count = signal(1);
    let log = 0;

    effect(({ isFirstExecution }) => {
      const value = count.value;

      if (isFirstExecution)
        return;

      log = value;
    });

    expect(log).toBe(0);

    count.set(5);
    expect(log).toBe(5);
  });

  it("effect should not run if no dependencies change", () => {
    const count = signal(1);
    let log = 0;

    effect(() => {
      log = count.value;
    });

    expect(log).toBe(1); // Initial run

    count.set(1); // No change
    expect(log).toBe(1); // Should not increment
  });

  it("startBatch and endBatch should batch updates", () => {
    const count = signal(0);
    let effectCount = 0;

    effect(() => {
      // eslint-disable-next-line ts/no-unused-expressions
      count.value;
      effectCount++;
    });

    // Reset after initial effect
    effectCount = 0;

    // Without batching, each update triggers the effect
    count.set(1);
    count.set(2);
    expect(effectCount).toBe(2);

    // With batching, updates are combined
    effectCount = 0;
    startBatch();
    count.set(3);
    count.set(4);
    count.set(5);
    expect(effectCount).toBe(0); // No effects yet
    endBatch();
    expect(effectCount).toBe(1); // Only one effect after batch
    expect(count.value).toBe(5);
  });

  it("should work with the new user example", () => {
    const count = signal(0);

    count.set(prev => prev + 1);

    effect(() => {
      // eslint-disable-next-line no-console
      console.log(count.value);
    });

    expect(count.value).toBe(1);
  });

  it("should work with the exact user example from instructions", () => {
    const count = signal(0);
    const logs: number[] = [];

    // eslint-disable-next-line no-console
    const originalLog = console.log;
    // eslint-disable-next-line no-console
    console.log = (value: number) => logs.push(value);

    count.set(prev => prev + 1); // This would be prev++ in the user's example

    effect(() => {
      // eslint-disable-next-line no-console
      console.log(count.value);
    });

    // eslint-disable-next-line no-console
    console.log = originalLog;
    expect(logs).toEqual([1]);
    expect(count.value).toBe(1);
  });
});
