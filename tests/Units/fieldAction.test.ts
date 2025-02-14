import { clearFieldsAction, fieldAction, removeFieldAction } from "@/actions";
import { type GlobalState } from "@/types";
import { describe, expect, it } from "@jest/globals";
import { initialState } from "@tests/Units/utils";

describe("Field action tests", () => {
  it("should add a new field", () => {
    const newState = fieldAction(["name"], initialState);
    expect(newState.fields).toEqual(["name"]);
  });

  it("should add multiple fields at once", () => {
    const newState = fieldAction(["name", "age"], initialState);
    expect(newState.fields).toEqual(["name", "age"]);
  });

  it("should not add duplicate fields", () => {
    const state: GlobalState = {
      ...initialState,
      fields: ["name"],
    };

    const newState = fieldAction(["name"], state);
    expect(newState.fields).toEqual(["name"]);
  });

  it("should remove an existing field", () => {
    const state: GlobalState = {
      ...initialState,
      fields: ["name"],
    };

    const newState = removeFieldAction(["name"], state);
    expect(newState.fields).toEqual([]);
  });

  it("should not remove a non-existing field", () => {
    const state: GlobalState = {
      ...initialState,
      fields: ["name"],
    };

    const newState = removeFieldAction(["age"], state);
    expect(newState.fields).toEqual(["name"]);
  });

  it("should be able to remove multiple fields", () => {
    const state: GlobalState = {
      ...initialState,
      fields: ["name", "age"],
    };

    const newState = removeFieldAction(["age", "name"], state);
    expect(newState.fields).toEqual([]);
  });

  it("should clear all fields at once", () => {
    const state: GlobalState = {
      ...initialState,
      fields: ["name", "age"],
    };

    const newState = clearFieldsAction(state);
    expect(newState.fields).toEqual([]);
  });

  it("should not duplicate fields when adding the same field multiple times", () => {
    const state: GlobalState = {
      ...initialState,
      fields: ["name"],
    };

    const newState = fieldAction(["name", "name", "name"], state);
    expect(newState.fields).toEqual(["name"]);
  });
});
