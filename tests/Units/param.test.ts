import {
  clearParamsAction,
  paramAction,
  removeParamAction,
} from "@/actions/param";
import { type GlobalState } from "@/types";
import { describe, expect, it } from "@jest/globals";
import { initialState } from "@tests/Units/utils";

describe("Param Action test: ", () => {
  it("should add a new param", () => {
    const result = paramAction("name", ["Carlos"], initialState);

    expect(result.params).toEqual({ name: ["Carlos"] });
  });

  it("should add a new param as string", () => {
    const result = paramAction("name", "Carlos", initialState);

    expect(result.params).toEqual({ name: ["Carlos"] });
  });

  it("should add a new param as number", () => {
    const result = paramAction("age", 18, initialState);

    expect(result.params).toEqual({ age: [18] });
  });

  it("should add multiple params with the same key", () => {
    const result = paramAction("name", ["Carlos", "Juan"], initialState);

    expect(result.params).toEqual({ name: ["Carlos", "Juan"] });
  });

  it("should update an existing param", () => {
    const state: GlobalState = {
      ...initialState,
      params: { name: ["Carlos"] },
    };

    const result = paramAction("name", ["Juan"], state);

    expect(result.params).toEqual({ name: ["Juan"] });
  });

  it("should remove a param", () => {
    const state: GlobalState = {
      ...initialState,
      params: { name: ["Carlos", "Juan"] },
    };

    const result = removeParamAction(["name"], state);

    expect(result.params).toEqual({});
  });

  it("should remove multiple params with the same key", () => {
    const state: GlobalState = {
      ...initialState,
      params: { name: ["Carlos", "Juan"] },
    };

    const result = removeParamAction(["name"], state);

    expect(result.params).toEqual({});
  });

  it("should work although the params are not in the state", () => {
    const result = removeParamAction(["name"], initialState);

    expect(result.params).toEqual({});
  });

  it("should clear all params at once", () => {
    const state: GlobalState = {
      ...initialState,
      params: { name: ["Carlos", "Juan"], last_name: ["Garcia", "Garcia"] },
    };

    const result = clearParamsAction(state);

    expect(result.params).toEqual({});
  });

  it("should clear all params at once even if they are not in the state", () => {
    const result = clearParamsAction(initialState);

    expect(result.params).toEqual({});
  });

  it("should allow multiple values for the same key", () => {
    const state: GlobalState = {
      ...initialState,
      params: { name: ["Carlos"] },
    };

    const result = paramAction("name", ["Carlos", "Garcia"], state);

    expect(result.params).toEqual({ name: ["Carlos", "Garcia"] });
  });
});
