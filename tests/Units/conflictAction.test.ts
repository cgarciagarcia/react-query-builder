import { reverseConflicts } from "@/actions/conflict";
import { describe, expect, it } from "@jest/globals";

describe("reverseConflicts", () => {
  it("should reverse conflicts correctly", () => {
    const conflicts = {
      date: ["beetween_date"],
      beetween_date: ["date", "month"],
    };

    const expected = {
      date: ["beetween_date"],
      beetween_date: ["date", "month"],
      month: ["beetween_date"],
    };

    expect(reverseConflicts(conflicts)).toEqual(expected);
  });

  it("should handle an empty conflict map", () => {
    const conflicts = {};

    const expected = {};

    expect(reverseConflicts(conflicts)).toEqual(expected);
  });

  it("should handle single conflict entries", () => {
    const conflicts = {
      filter1: ["filter2"],
    };

    const expected = {
      filter1: ["filter2"],
      filter2: ["filter1"],
    };

    expect(reverseConflicts(conflicts)).toEqual(expected);
  });

  it("should handle multiple conflicts correctly", () => {
    const conflicts = {
      filter1: ["filter2", "filter3"],
      filter2: ["filter3"],
    };

    const expected = {
      filter1: ["filter2", "filter3"],
      filter2: ["filter1", "filter3"],
      filter3: ["filter1", "filter2"],
    };

    expect(reverseConflicts(conflicts)).toEqual(expected);
  });

  it("should not duplicate entries in the reversed map", () => {
    const conflicts = {
      filter1: ["filter2", "filter2"],
      filter2: ["filter3", "filter3", "filter3"],
    };

    const expected = {
      filter1: ["filter2"],
      filter2: ["filter1", "filter3"],
      filter3: ["filter2"],
    };

    expect(reverseConflicts(conflicts)).toEqual(expected);
  });
});
