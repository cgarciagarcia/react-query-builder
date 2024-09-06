import { toArray } from "@/actions/presenter";
import { type GlobalState } from "@/types";
import { expect, it } from "@jest/globals";
import { initialState } from "@tests/Units/utils";

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
