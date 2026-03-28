import { whenAction } from "@/actions/when";
import { initialState } from "@tests/Units/utils";
import { describe, expect, it } from "vitest";

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
