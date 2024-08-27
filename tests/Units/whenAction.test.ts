import { whenAction } from "@/actions/when";
import { describe, expect, it } from "@jest/globals";
import { initialState } from "@tests/Units/utils";

describe("Testing when action", () => {
  it("should return the same state when condition is false", () => {
    let value = null;
    whenAction(
      false,
      (state) => {
        value = state;
      },
      initialState,
    );
    expect(value).toEqual(null);
  });

  it("should return a new include state when condition is true", () => {
    let value = null;
    whenAction(
      true,
      (state) => {
        value = state;
      },
      initialState,
    );
    expect(value).toEqual(initialState);
  });
});
