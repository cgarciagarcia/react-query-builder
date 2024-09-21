import { type GlobalState } from "@/types";
import { hasField, hasFilter, hasInclude, hasParam, hasSort } from "@/utils";
import { describe, expect, it } from "@jest/globals";
import { initialState } from "@tests/Units/utils";

describe("Utilities state test", function () {
  it("should check if a filter exists", function () {
    const state: GlobalState = {
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos"],
        },
        {
          attribute: "last_name",
          value: ["Garcia"],
        },
      ],
    };

    expect(hasFilter(["none", "name"], state)).toEqual(true);
  });

  it("should check if a filter does not exist", function () {
    const state: GlobalState = {
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos"],
        },
        {
          attribute: "last_name",
          value: ["Garcia"],
        },
      ],
    };

    expect(hasFilter(["age"], state)).toEqual(false);
  });

  it("should check if a filter exists with alias", function () {
    const state: GlobalState = {
      ...initialState,
      aliases: {
        name: "n",
      },
      filters: [
        {
          attribute: "name",
          value: ["Carlos"],
        },
      ],
    };

    expect(hasFilter(["name"], state)).toEqual(true);
  });

  it("should check if a filter does not exist with alias", () => {
    const state: GlobalState = {
      ...initialState,
      aliases: {
        name: "n",
      },
      filters: [
        {
          attribute: "name",
          value: ["Carlos"],
        },
      ],
    };

    expect(hasFilter(["age"], state)).toEqual(false);
  });

  it("should check a include exists", () => {
    const state: GlobalState = {
      ...initialState,
      includes: ["i"],
    };
    expect(hasInclude(["i"], state)).toEqual(true);
  });

  it("should check a include does not exist", () => {
    const state: GlobalState = {
      ...initialState,
      includes: ["i"],
    };
    expect(hasInclude(["j"], state)).toEqual(false);
  });

  it("should check an include doesn't exist", () => {
    const state: GlobalState = {
      ...initialState,
      includes: ["i"],
    };
    expect(hasInclude(["j"], state)).toEqual(false);
  });

  it("should check if a sort exists", () => {
    const state: GlobalState = {
      ...initialState,
      sorts: [
        {
          attribute: "name",
          direction: "asc",
        },
        {
          attribute: "age",
          direction: "desc",
        },
      ],
    };
    expect(hasSort(["attr1", "attr2", "age"], state)).toEqual(true);
  });

  it("should check if a sort does not exist", () => {
    const state: GlobalState = {
      ...initialState,
      sorts: [
        {
          attribute: "name",
          direction: "asc",
        },
        {
          attribute: "age",
          direction: "desc",
        },
      ],
    };
    expect(hasSort(["attr1", "attr2", "height"], state)).toEqual(false);
  });

  it("should check if a field exists", () => {
    const state: GlobalState = {
      ...initialState,
      fields: ["name", "age", "gender"],
    };
    expect(hasField(["attr1", "attr2", "name"], state)).toEqual(true);
  });

  it("should check if a field does not exist", () => {
    const state: GlobalState = {
      ...initialState,
      fields: ["name", "age", "gender"],
    };
    expect(hasField(["attr1", "attr2", "height"], state)).toEqual(false);
  });

  it("should check if a param exists", () => {
    const state: GlobalState = {
      ...initialState,
      params: { name: ["Carlos"] },
    };
    expect(hasParam(["name"], state)).toEqual(true);
  });
});
