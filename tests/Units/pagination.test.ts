import { limitAction, pageAction } from "@/actions/pagination";
import { describe, expect, it } from "@jest/globals";
import { initialState } from "@tests/Units/utils";

describe("Pagination tests", () => {
  it("should add page param to the url", () => {
    const result = pageAction(1, initialState);

    expect(result.pagination).toEqual({ page: 1 });
  });

  it("should overwrite existing page param to the url", () => {
    let result = pageAction(1, initialState);
    result = limitAction(2, result);

    expect(result.pagination).toEqual({ page: 1, limit: 2 });
  });

  it("should add page and limit param to the url", () => {
    let result = pageAction(1, initialState);
    result = limitAction(10, result);

    expect(result.pagination).toEqual({ page: 1, limit: 10 });
  });
});
