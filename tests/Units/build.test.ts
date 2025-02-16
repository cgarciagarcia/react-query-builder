import { buildAction } from "@/actions/build";
import { FilterOperator, type GlobalState } from "@/types";
import { describe, expect, it } from "@jest/globals";
import { initialState } from "@tests/Units/utils";

describe("Assert build method is working correctly", () => {
  it("should return a empty url", () => {
    const val = buildAction(initialState);
    expect(val).toBe("");
  });

  it("should return a valid query with one filter", () => {
    const val = buildAction({
      ...initialState,
      filters: [
        {
          attribute: "date",
          value: ["2024-01-01"],
        },
      ],
    });
    expect(val).toBe("?filter[date]=2024-01-01");
  });

  it("should return a valid query with multiple values for one filter", () => {
    const val = buildAction({
      ...initialState,
      filters: [
        {
          attribute: "date",
          value: ["2024-01-01", "2024-01-02"],
        },
        {
          attribute: "name",
          value: ["Carlos garcia"],
        },
      ],
    });
    expect(val).toBe(
      "?filter[date]=2024-01-01,2024-01-02&filter[name]=Carlos+garcia",
    );
  });

  it("should return a valid query with include", () => {
    expect(
      buildAction({
        ...initialState,
        includes: ["user"],
      }),
    ).toBe("?include=user");
  });

  it("should return a valid query with multiple includes", () => {
    expect(
      buildAction({
        ...initialState,
        includes: ["user", "works"],
      }),
    ).toBe("?include=user,works");
  });

  it("should return a valid query with sorts ascending", () => {
    expect(
      buildAction({
        ...initialState,
        sorts: [
          {
            attribute: "name",
            direction: "asc",
          },
        ],
      }),
    ).toBe("?sort=name");
  });

  it("should return a valid query with sorts descending", () => {
    expect(
      buildAction({
        ...initialState,
        sorts: [
          {
            attribute: "name",
            direction: "desc",
          },
        ],
      }),
    ).toBe("?sort=-name");
  });

  it("should return a valid query string with filters, includes, and sorts", () => {
    expect(
      buildAction({
        ...initialState,
        filters: [
          {
            attribute: "name",
            value: ["Carlos garcia"],
          },
          {
            attribute: "date",
            value: ["2024-01-01", "2024-01-02"],
          },
        ],
        includes: ["user", "works"],
        sorts: [
          {
            attribute: "name",
            direction: "asc",
          },
          {
            attribute: "date",
            direction: "desc",
          },
        ],
      }),
    ).toBe(
      "?filter[name]=Carlos+garcia&filter[date]=2024-01-01,2024-01-02&sort=name,-date&include=user,works",
    );
  });

  it("Should return a valid query string filter using aliases", () => {
    expect(
      buildAction({
        ...initialState,
        aliases: {
          user: "u",
        },
        filters: [
          {
            attribute: "user",
            value: ["1"],
          },
        ],
      }),
    ).toBe("?filter[u]=1");
  });

  it("should use custom delimiters", () => {
    const state: GlobalState<Record<string, string>> = {
      ...initialState,
      fields: ["user.name", "user.age"],
      aliases: {
        user: "u",
      },
      filters: [
        {
          attribute: "user",
          value: ["1"],
        },
      ],
      includes: ["address", "other"],
      delimiters: {
        global: "|",
        fields: ":",
        filters: ":",
        sorts: ":",
        includes: ":",
        params: ":",
      },
      sorts: [
        { attribute: "name", direction: "asc" },
        { attribute: "id", direction: "desc" },
      ],
      params: {
        param1: [1, 2],
        param2: ["string1", "string2"],
      },
    };

    const val = buildAction(state);

    expect(val).toBe(
      "?filter[u]=1&fields[user]=name:age&sort=name:-id&include=address:other&param1=1:2&param2=string1:string2",
    );
  });

  it("should use custom delimiter and fields with model and without model", () => {
    const val = buildAction({
      ...initialState,
      fields: ["user.name", "asd", "dsa"],
      delimiters: {
        global: "|",
        fields: ":",
        filters: ":",
        sorts: ":",
        includes: ":",
        params: ":",
      },
    });

    expect(val).toBe("?fields[user]=name&fields=asd:dsa");
  });

  it("should use global delimiters", () => {
    const state: GlobalState<Record<string, string>> = {
      ...initialState,
      fields: ["user.name", "user.age"],
      aliases: {
        user: "u",
      },
      filters: [
        {
          attribute: "user",
          value: ["1"],
        },
      ],
      includes: ["address", "other"],
      delimiters: {
        global: "|",
        fields: null,
        filters: null,
        sorts: null,
        includes: null,
        params: null,
      },
      sorts: [
        { attribute: "name", direction: "asc" },
        { attribute: "id", direction: "desc" },
      ],
    };
    const val = buildAction(state);

    expect(val).toBe(
      "?filter[u]=1&fields[user]=name|age&sort=name|-id&include=address|other",
    );
  });

  it("should remove question mark if useQuestionMark is false", () => {
    const val = buildAction({
      ...initialState,
      useQuestionMark: false,
      filters: [
        {
          attribute: "name",
          value: ["Carlos garcia"],
        },
      ],
    });

    expect(val).toBe("filter[name]=Carlos+garcia");
  });

  it("should build with custom params", () => {
    const val = buildAction({
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos garcia"],
        },
      ],
      params: {
        page: [2],
        limit: [10],
      },
    });

    expect(val).toBe("?filter[name]=Carlos+garcia&page=2&limit=10");
  });

  it("should build with operators in filter", () => {
    const greaterThan = buildAction({
      ...initialState,
      filters: [
        {
          attribute: "age",
          value: [18],
          operator: ">",
        },
      ],
    });

    expect(greaterThan).toBe("?filter[age]=>18");

    const lessThan = buildAction({
      ...initialState,
      filters: [
        {
          attribute: "age",
          value: [18],
          operator: FilterOperator.LessThan,
        },
      ],
    });

    expect(lessThan).toBe("?filter[age]=<18");

    const lessThanEqual = buildAction({
      ...initialState,
      filters: [
        {
          attribute: "age",
          value: [18],
          operator: "<=",
        },
      ],
    });

    expect(lessThanEqual).toBe("?filter[age]=<=18");

    const greaterThanEqual = buildAction({
      ...initialState,
      filters: [
        {
          attribute: "age",
          value: [18],
          operator: ">=",
        },
      ],
    });

    expect(greaterThanEqual).toBe("?filter[age]=>=18");

    const distinct = buildAction({
      ...initialState,
      filters: [
        {
          attribute: "age",
          value: [18],
          operator: "<>",
        },
      ],
    });

    expect(distinct).toBe("?filter[age]=<>18");
  });

  it("should build with pagination", () => {
    const val = buildAction({
      ...initialState,
      pagination: {
        page: 2,
        limit: 10,
      },
    });

    expect(val).toBe("?page=2&limit=10");
  });
});
