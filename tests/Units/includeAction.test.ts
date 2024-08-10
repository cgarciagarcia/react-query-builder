import {
  clearIncludeAction,
  includeAction,
  removeIncludeAction,
} from "@/actions";
import { type GlobalState } from "@/types";
import { describe, expect, it } from "@jest/globals";
import { initialState } from "@tests/Units/utils";

describe("Include Action test: ", () => {
  it("should add a new include", () => {
    const result = includeAction(["user"], initialState);

    expect(result.includes).toEqual(["user"]);
  });

  it("should not add duplicate includes", () => {
    const state: GlobalState = {
      ...initialState,
      includes: ["user"],
    };

    const result = includeAction(["user"], state);

    expect(result.includes).toEqual(["user"]);
  });

  it("should be possible to add multiple includes", () => {
    const result = includeAction(["user", "works"], initialState);

    expect(result.includes).toEqual(["user", "works"]);
  });

  it("should be possible to remove an include", () => {
    const state: GlobalState = {
      ...initialState,
      includes: ["user", "works"],
    };

    const result = removeIncludeAction(["works"], state);

    expect(result.includes).toEqual(["user"]);
  });

  it("should be possible to remove multiple includes", () => {
    const state: GlobalState = {
      ...initialState,
      includes: ["user", "works"],
    };

    const result = removeIncludeAction(["user", "works"], state);

    expect(result.includes).toEqual([]);
  });

  it("should clear all includes at once", () => {
    const state: GlobalState = {
      ...initialState,
      includes: ["user", "works"],
    };

    const result = clearIncludeAction(state);

    expect(result.includes).toEqual([]);
  });
});
