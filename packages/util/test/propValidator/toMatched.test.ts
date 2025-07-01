import { describe, expect, it } from "vitest";

import { toMatched } from "../../src/propValidator/toMatched";

describe("toMatched", () => {
  it("returns the value when it exists in the array", () => {
    expect(toMatched("a", ["a", "b", "c"])).toBe("a");
    // nullはstring[]との制約に合わないためこのテストは削除
  });

  it("returns undefined when the value doesn't exist in the array", () => {
    expect(toMatched("d", ["a", "b", "c"])).toBeUndefined();
    expect(toMatched(undefined, ["a", "b"])).toBeUndefined();
  });

  it("works with empty arrays", () => {
    expect(toMatched("a", [])).toBeUndefined();
    expect(toMatched(undefined, [])).toBeUndefined();
  });

  it("works with special string values", () => {
    expect(toMatched("", ["", "value"])).toBe("");
    expect(toMatched(" ", ["a", " ", "b"])).toBe(" ");
    expect(toMatched("特殊文字", ["abc", "特殊文字", "xyz"])).toBe("特殊文字");
  });
});
