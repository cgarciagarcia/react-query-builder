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

  it("should be possible to clear fields", () => {
    const builder = new Builder({ ...initialConfig, fields: ["name", "age"] });
    builder.clearFields();
    expect(builder.build()).toBe("");
  });

  it("shoould be possible to clear filters", () => {
    const builder = new Builder({
      ...initialConfig,
      filters: [{ attribute: "name", value: ["John Doe"] }],
    });
    builder.clearFilters();
    expect(builder.build()).toBe("");
  });

  it("should be possible to clear includes", () => {
    const builder = new Builder({ ...initialConfig, includes: ["address"] });
    builder.clearIncludes();
    expect(builder.build()).toBe("");
  });
  it("should be possible to clear params", () => {
    const builder = new Builder({ ...initialConfig, params: { page: [1] } });
    builder.clearParams();
    expect(builder.build()).toBe("");
  });
  it("should be possible to clear sorts", () => {
    const builder = new Builder({
      ...initialConfig,
      sorts: [{ attribute: "name", direction: "asc" }],
    });
    builder.clearSorts();
    expect(builder.build()).toBe("");
  });
  it("should be possible to get the current page", () => {
    const builder = new Builder({
      pagination: { page: 2, limit: 10 },
    });
    expect(builder.getCurrentPage()).toBe(2);
  });
  it("should be possible to check if a field is present", () => {
    const builder = new Builder({ ...initialConfig, fields: ["name", "age"] });
    expect(builder.hasField("name", "age")).toBe(true);
  });
  it("should be possible to check if a filter is present", () => {
    const builder = new Builder({
      filters: [
        { attribute: "name", value: ["John Doe"] },
        {
          attribute: "age",
          value: [30],
        },
      ],
    });
    expect(builder.hasFilter("name", "age")).toBe(true);
  });

  it("should be possible to check if an include is present", () => {
    const builder = new Builder({ ...initialConfig, includes: ["address"] });
    expect(builder.hasInclude("address")).toBe(true);
  });

  it("should be possible to check if a param is present", () => {
    const builder = new Builder({ ...initialConfig, params: { page: [1] } });
    expect(builder.hasParam("page")).toBe(true);
  });
  it("should be possible to check if a sort is present", () => {
    const builder = new Builder({
      sorts: [{ attribute: "name", direction: "asc" }],
    });
    expect(builder.hasSort("name")).toBe(true);
  });
  it("should be possible to move to the next page", () => {
    const builder = new Builder({
      pagination: { page: 1, limit: 10 },
    });
    builder.nextPage();
    expect(builder.getCurrentPage()).toBe(2);
  });
  it("should be possible to move to the previous page", () => {
    const builder = new Builder({
      pagination: { page: 2, limit: 10 },
    });
    builder.previousPage();
    expect(builder.getCurrentPage()).toBe(1);
  });
  it("should be possible to remove a field", () => {
    const builder = new Builder({ ...initialConfig, fields: ["name", "age"] });
    builder.removeField("age");
    expect(builder.build()).toBe("?fields=name");
  });
  it("should be possible to remove a filter", () => {
    const builder = new Builder({
      filters: [{ attribute: "name", value: ["John Doe"] }],
    });
    builder.removeFilter("name");
    expect(builder.build()).toBe("");
  });
  it("should be possible to remove an include", () => {
    const builder = new Builder({ ...initialConfig, includes: ["address"] });
    builder.removeInclude("address");
    expect(builder.build()).toBe("");
  });
  it("should be possible to remove a param", () => {
    const builder = new Builder({ ...initialConfig, params: { page: [1] } });
    builder.removeParam("page");
    expect(builder.build()).toBe("");
  });
  it("should be possible to remove a sort", () => {
    const builder = new Builder({
      sorts: [
        { attribute: "name", direction: "asc" },
        { attribute: "age", direction: "desc" },
      ],
    });
    builder.removeSort("name", "age");
    expect(builder.build()).toBe("");
  });
  it("should be possible to set a param", () => {
    const builder = new Builder(initialConfig);
    builder.setParam("page", 1);
    expect(builder.build()).toBe("?page=1");
  });
  it("should be possible to set a param with an array", () => {
    const builder = new Builder(initialConfig);
    builder.setParam("ids", [1, 2, 3]);
    expect(builder.build()).toBe("?ids=1,2,3");
  });
  it("should be possible to set a param with multiple values", () => {
    const builder = new Builder(initialConfig);
    builder.setParam("nested", [1, 1, 1, 1]);
    expect(builder.build()).toBe("?nested=1,1,1,1");
  });
  it("should be possible to tap into the state", () => {
    const builder = new Builder(initialConfig);
    let called = false;
    builder.tap((state) => {
      called = true;
      expect(state).toEqual(initialConfig);
    });
    expect(called).toBe(true);
  });
  it("should be possible to convert the builder to an array", () => {
    const builder = new Builder({
      ...initialConfig,
      filters: [
        {
          attribute: "name",
          value: ["John Doe"],
        },
      ],
      params: {
        gtm: ["some-track-id"],
      },
      fields: ["name", "age"],
      includes: ["address"],
      sorts: [
        {
          attribute: "name",
          direction: "asc",
        },
      ],
      pagination: {
        page: 2,
        limit: 10,
      },
    });
    const array = builder.toArray();
    expect(array).toEqual([
      "filter[name]=John+Doe",
      "fields=name,age",
      "sort=name",
      "include=address",
      "gtm=some-track-id",
      "page=2",
      "limit=10",
    ]);
  });
  it("should be possible to convert the builder to an array with aliases", () => {
    const builder = new Builder({
      aliases: {
        name: "full_name",
        age: "person_age",
        address: "contact_address",
      },
      filters: [
        {
          attribute: "full_name",
          value: ["John Doe"],
        },
      ],
      params: {
        gtm: ["some-track-id"],
      },
      fields: ["full_name", "person_age"],
      includes: ["contact_address"],
      sorts: [
        {
          attribute: "full_name",
          direction: "asc",
        },
      ],
      pagination: {
        page: 2,
        limit: 10,
      },
    });
    const array = builder.toArray();
    expect(array).toEqual([
      "filter[full_name]=John+Doe",
      "fields=full_name,person_age",
      "sort=full_name",
      "include=contact_address",
      "gtm=some-track-id",
      "page=2",
      "limit=10",
    ]);
  });
  it("shoul be possible to usen when method", () => {
    const builder = new Builder(initialConfig);
    let called = false;
    builder.when(true, (state) => {
      called = true;
      expect(state).toEqual(initialConfig);
    });
    expect(called).toBe(true);
  });
});
