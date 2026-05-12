import { type GlobalState } from "@/types";
import { parseSearchParams } from "@/utils/parseSearchParams";
import { describe, expect, it } from "vitest";

describe("parseSearchParams", () => {
  it.each([[""], ["?"], ["?unknown=x"]])(
    "returns {} for non-recognised input (%j)",
    (input) => {
      expect(parseSearchParams(input)).toEqual({});
    },
  );

  it.each<[string, string, Partial<GlobalState>]>([
    [
      "filters with single and multi-value",
      "?filter[status]=active,pending&filter[name]=John",
      {
        filters: [
          { attribute: "status", value: ["active", "pending"] },
          { attribute: "name", value: ["John"] },
        ],
      },
    ],
    [
      "filters with operator prefixes",
      "?filter[age]=>=18&filter[score]=<>0",
      {
        filters: [
          { attribute: "age", value: ["18"], operator: ">=" },
          { attribute: "score", value: ["0"], operator: "<>" },
        ],
      },
    ],
    [
      "filter keys with empty value (with and without operator)",
      "?filter[status]=&filter[score]=>=",
      {
        filters: [
          { attribute: "status", value: [] },
          { attribute: "score", value: [], operator: ">=" },
        ],
      },
    ],
    [
      "sort with desc prefix and asc default",
      "?sort=-created_at,name",
      {
        sorts: [
          { attribute: "created_at", direction: "desc" },
          { attribute: "name", direction: "asc" },
        ],
      },
    ],
    [
      "include into a flat array",
      "?include=user,team",
      { includes: ["user", "team"] },
    ],
    [
      "bare and bracketed fields collapsed into dotted notation",
      "?fields=id&fields[user]=name,email",
      { fields: ["id", "user.name", "user.email"] },
    ],
  ])("parses %s", (_label, input, expected) => {
    expect(parseSearchParams(input)).toEqual(expected);
  });

  it("honours custom URL keys", () => {
    expect(
      parseSearchParams(
        "?filt[status]=active&srt=-name&inc=user&fld[user]=id",
        {
          keys: { filter: "filt", sort: "srt", include: "inc", fields: "fld" },
        },
      ),
    ).toEqual({
      filters: [{ attribute: "status", value: ["active"] }],
      sorts: [{ attribute: "name", direction: "desc" }],
      includes: ["user"],
      fields: ["user.id"],
    });
  });

  it("captures only allowlisted unknown params (ignores the rest)", () => {
    expect(
      parseSearchParams("?locale=es&tenant=acme&spy=1", {
        allowedParams: ["locale", "tenant"],
      }),
    ).toEqual({ params: { locale: ["es"], tenant: ["acme"] } });
  });
});
