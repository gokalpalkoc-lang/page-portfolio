import { describe, expect, it } from "vitest";
import { moveItem, removeItem, replaceItem, splitList } from "@/lib/list";

describe("list helpers", () => {
  it("moves items within bounds only", () => {
    expect(moveItem(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(moveItem(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
    expect(moveItem(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], 1, 1)).toEqual(["a", "b"]);
  });

  it("replaces and removes by index", () => {
    expect(replaceItem(["a", "b"], 1, "x")).toEqual(["a", "x"]);
    expect(removeItem(["a", "b", "c"], 1)).toEqual(["a", "c"]);
  });

  it("splits delimited text, dropping blanks", () => {
    expect(splitList("React, Next.js,, ", ",")).toEqual(["React", "Next.js"]);
    expect(splitList("One\n\n Two \n", "\n")).toEqual(["One", "Two"]);
  });
});
