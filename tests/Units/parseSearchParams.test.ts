import { parseSearchParams } from "@/utils/parseSearchParams";
import { describe, expect, it } from "vitest";

describe("parseSearchParams", () => {
  it("returns an empty object for an empty search string", () => {
    expect(parseSearchParams("")).toEqual({});
    expect(parseSearchParams("?")).toEqual({});
  });

  it("parses default filter keys with comma-separated values", () => {
    const result = parseSearchParams(
      "?filter[status]=active,pending&filter[name]=John",
    );

    expect(result.filters).toEqual([
      { attribute: "status", value: ["active", "pending"] },
      { attribute: "name", value: ["John"] },
    ]);
  });

  it("recovers the operator prefix from a filter value", () => {
    const result = parseSearchParams("?filter[age]=>=18&filter[score]=<>0");

    expect(result.filters).toEqual([
      { attribute: "age", value: ["18"], operator: ">=" },
      { attribute: "score", value: ["0"], operator: "<>" },
    ]);
  });

  it("parses sort with desc prefix and asc default", () => {
    const result = parseSearchParams("?sort=-created_at,name");

    expect(result.sorts).toEqual([
      { attribute: "created_at", direction: "desc" },
      { attribute: "name", direction: "asc" },
    ]);
  });

  it("parses include into a flat array", () => {
    const result = parseSearchParams("?include=user,team");
    expect(result.includes).toEqual(["user", "team"]);
  });

  it("parses both bare and bracketed fields into dotted notation", () => {
    const result = parseSearchParams("?fields=id&fields[user]=name,email");
    expect(result.fields).toEqual(["id", "user.name", "user.email"]);
  });

  it("honours custom URL keys", () => {
    const result = parseSearchParams(
      "?filt[status]=active&srt=-name&inc=user&fld[user]=id",
      {
        keys: { filter: "filt", sort: "srt", include: "inc", fields: "fld" },
      },
    );

    expect(result.filters).toEqual([
      { attribute: "status", value: ["active"] },
    ]);
    expect(result.sorts).toEqual([{ attribute: "name", direction: "desc" }]);
    expect(result.includes).toEqual(["user"]);
    expect(result.fields).toEqual(["user.id"]);
  });

  it("ignores unknown params when no allowlist is provided", () => {
    const result = parseSearchParams("?locale=es&tenant=acme");
    expect(result.params).toBeUndefined();
  });

  it("captures only allowlisted unknown params", () => {
    const result = parseSearchParams("?locale=es&tenant=acme&spy=1", {
      allowedParams: ["locale", "tenant"],
    });

    expect(result.params).toEqual({
      locale: ["es"],
      tenant: ["acme"],
    });
  });

  it("does not return empty collections when nothing was parsed", () => {
    const result = parseSearchParams("?unknown=x");
    expect(result).toEqual({});
  });
});
