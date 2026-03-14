import { toArray } from "@/actions/presenter";
import { type GlobalState } from "@/types";
import { describe, expect, it } from "@jest/globals";
import { initialState } from "@tests/Units/utils";

describe("toArray", () => {
  it("should return an array with all elements from the state", () => {
    const filters: GlobalState = {
      ...initialState,
      filters: [
        { attribute: "name", value: ["Carlos"] },
        { attribute: "age", value: [25] },
      ],
      fields: ["user.name", "user.lastName"],
      includes: ["addresses", "jobs"],
      sorts: [{ attribute: "age", direction: "desc" }],
      params: { page: [1], perPage: [10] },
    };

    const expected = [
      "filter[name]=Carlos",
      "filter[age]=25",
      "fields[user]=name,lastName",
      "sort=-age",
      "include=addresses,jobs",
      "page=1",
      "perPage=10",
    ];
    const result = toArray(filters);

    expect(result).toEqual(expected);
  });

  it("should return an empty array when there is no state", () => {
    const result = toArray(initialState);
    expect(result).toEqual([]);
  });

  it("should join multiple filter values using a custom filter delimiter", () => {
    const state: GlobalState = {
      ...initialState,
      delimiters: { ...initialState.delimiters, filters: "|" },
      filters: [{ attribute: "status", value: ["active", "pending"] }],
    };

    const result = toArray(state);
    expect(result).toEqual(["filter[status]=active|pending"]);
  });

  it("should join multiple include values using a custom include delimiter", () => {
    const state: GlobalState = {
      ...initialState,
      delimiters: { ...initialState.delimiters, includes: ";" },
      includes: ["addresses", "jobs"],
    };

    const result = toArray(state);
    expect(result).toEqual(["include=addresses;jobs"]);
  });

  it("should join multiple sort values using a custom sort delimiter", () => {
    const state: GlobalState = {
      ...initialState,
      delimiters: { ...initialState.delimiters, sorts: "|" },
      sorts: [
        { attribute: "name", direction: "asc" },
        { attribute: "age", direction: "desc" },
      ],
    };

    const result = toArray(state);
    expect(result).toEqual(["sort=name|-age"]);
  });
});
