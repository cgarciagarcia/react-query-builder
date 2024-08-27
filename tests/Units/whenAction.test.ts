import { whenAction } from "@/actions/when";
import { describe, expect, it } from "@jest/globals";
import { initialState } from "@tests/Units/utils";

describe("Testing when action", () => {
  it("shouldn't execute the callback when condition is false", () => {
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

  it("should execute the callback when condition is true", () => {
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
