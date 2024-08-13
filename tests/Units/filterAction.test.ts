import {
  clearFiltersAction,
  filterAction,
  removeFilterAction,
} from "@/actions";
import { reverseConflicts } from "@/actions/conflict";
import { type GlobalState } from "@/types";
import { describe, expect, it } from "@jest/globals";
import { initialState } from "@tests/Units/utils";

describe("Filter Action test: ", () => {
  it("should add a new filter", () => {
    const result = filterAction("name", "Carlos Garcia", initialState);

    expect(result.filters).toEqual([
      {
        attribute: "name",
        value: ["Carlos Garcia"],
      },
    ]);
  });

  it("Should update an existing filter", () => {
    const state: GlobalState = {
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos Garcia"],
        },
      ],
    };

    const result = filterAction("name", ["Juan Perez"], state);

    expect(result.filters).toEqual([
      {
        attribute: "name",
        value: ["Carlos Garcia", "Juan Perez"],
      },
    ]);
  });

  it("Should be possible to add multiple filter with the same attribute", () => {
    const result = filterAction(
      "name",
      ["Carlos Garcia", "Juan Perez"],
      initialState,
    );

    expect(result.filters).toEqual([
      {
        attribute: "name",
        value: ["Carlos Garcia", "Juan Perez"],
      },
    ]);
  });

  it("Should possible to remove a filter", () => {
    const state: GlobalState = {
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos Garcia", "Juan Perez"],
        },
        {
          attribute: "age",
          value: [28],
        },
      ],
    };

    const result = removeFilterAction(["name"], state);

    expect(result.filters).toEqual([
      {
        attribute: "age",
        value: [28],
      },
    ]);
  });

  it("Should be possible to remove multiple filters at the same time", () => {
    const state: GlobalState = {
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos Garcia", "Juan Perez"],
        },
        {
          attribute: "age",
          value: [28],
        },
      ],
    };

    const result = removeFilterAction(["name", "age"], state);

    expect(result.filters).toEqual([]);
  });

  it("Should clear all filters at once", () => {
    const state: GlobalState = {
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos Garcia", "Juan Perez"],
        },
        {
          attribute: "age",
          value: [28],
        },
      ],
    };

    const result = clearFiltersAction(state);

    expect(result.filters).toEqual([]);
  });

  it("Should be possible to add a new filter with an alias", () => {
    const state: GlobalState = {
      ...initialState,
      aliases: {
        user: "u",
      },
      filters: [
        {
          attribute: "user",
          value: ["Carlos"],
        },
      ],
    };

    const result = filterAction("last_name", "Garcia", state);

    expect(result.filters).toEqual([
      {
        attribute: "user",
        value: ["Carlos"],
      },
      {
        attribute: "last_name",
        value: ["Garcia"],
      },
    ]);
  });

  it("should ", () => {
    const state: GlobalState = {
      ...initialState,
      pruneConflictingFilters: reverseConflicts({
        date: ["month"],
      }),
      filters: [
        {
          attribute: "date",
          value: ["2024-01-01"],
        },
      ],
    };

    const result = filterAction("month", "01", state);

    expect(result.filters).toEqual([
      {
        attribute: "month",
        value: ["01"],
      },
    ]);
  });
});
