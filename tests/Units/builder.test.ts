import { Builder } from "@/classes/Builder";
import { describe, expect, it } from "@jest/globals";
import { initialConfig } from "@tests/Units/utils";

describe("Testing the class Builder", () => {
  it("should be possible to filter", () => {
    const builder = new Builder(initialConfig);
    builder.filter("name", "John Doe");
    expect(builder.build()).toBe("?filter[name]=John+Doe");
  });

  it("should be possible to add a field", () => {
    const builder = new Builder({ ...initialConfig, fields: ["name"] });

    expect(builder.build()).toBe("?fields=name");
  });

  it("should be possible to sort ascending", () => {
    const builder = new Builder({
      ...initialConfig,
      sorts: [
        {
          attribute: "name",
          direction: "asc",
        },
      ],
    });
    expect(builder.build()).toBe("?sort=name");
  });
  it("shoul be possible to sort descending", () => {
    const builder = new Builder({
      ...initialConfig,
      sorts: [
        {
          attribute: "name",
          direction: "desc",
        },
      ],
    });
    expect(builder.build()).toBe("?sort=-name");
  });

  it("should be possible to add a include", () => {
    const builder = new Builder({ ...initialConfig, includes: ["address"] });
    expect(builder.build()).toBe("?include=address");
  });

  it("should be possible to add a limit and page", () => {
    const builder = new Builder({
      ...initialConfig,
      pagination: { page: 1, limit: 10 },
    });
    builder.limit(11);
    builder.page(2);
    expect(builder.build()).toBe("?page=2&limit=11");
  });

  // do the tests using jest for the following Builder methods: build,clearFields,clearFilters,clearIncludes.clearParams,clearSorts,getCurrentPage,hasField,hasFilter,hasInclude,hasParam,hasSort,nextPage,previousPage,removeField,removeFilter,removeInclude,removeParam,removeSort,setParam,tap,toArray,when

  it("should be possible to clear fields", () => {
    const builder = new Builder({ ...initialConfig, fields: ["name", "age"] });
    builder.clearFields();
    expect(builder.build()).toBe("");
  });
});
