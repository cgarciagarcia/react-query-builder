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

  describe("aliases (reverse lookup)", () => {
    it("rewrites filter and sort attributes from backend → frontend", () => {
      expect(
        parseSearchParams("?filter[name]=John&sort=-created_at", {
          aliases: { userName: "name", createdAt: "created_at" },
        }),
      ).toEqual({
        filters: [{ attribute: "userName", value: ["John"] }],
        sorts: [{ attribute: "createdAt", direction: "desc" }],
      });
    });

    it("leaves attributes untouched when no alias matches", () => {
      expect(
        parseSearchParams("?filter[unknown]=x", {
          aliases: { userName: "name" },
        }),
      ).toEqual({ filters: [{ attribute: "unknown", value: ["x"] }] });
    });

    it("first-wins on alias collisions (multiple frontends → same backend)", () => {
      expect(
        parseSearchParams("?filter[name]=John", {
          aliases: { userName: "name", fullName: "name" },
        }),
      ).toEqual({ filters: [{ attribute: "userName", value: ["John"] }] });
    });
  });

  describe("excludeKeys (defense in depth)", () => {
    it("drops filters whose attribute is in the denylist", () => {
      expect(
        parseSearchParams(
          "?filter[is_admin]=true&filter[status]=active",
          { excludeKeys: ["is_admin"] },
        ),
      ).toEqual({ filters: [{ attribute: "status", value: ["active"] }] });
    });

    it("drops sorts and includes whose attribute is in the denylist", () => {
      expect(
        parseSearchParams("?sort=-is_admin,name&include=secret,user", {
          excludeKeys: ["is_admin", "secret"],
        }),
      ).toEqual({
        sorts: [{ attribute: "name", direction: "asc" }],
        includes: ["user"],
      });
    });

    it("drops fields (bare and bracketed) that match the denylist", () => {
      expect(
        parseSearchParams(
          "?fields=id,password&fields[user]=name,password",
          { excludeKeys: ["password"] },
        ),
      ).toEqual({ fields: ["id", "user.name"] });
    });

    it("denylist overrides the params allowlist", () => {
      expect(
        parseSearchParams("?locale=es&secret=leak", {
          allowedParams: ["locale", "secret"],
          excludeKeys: ["secret"],
        }),
      ).toEqual({ params: { locale: ["es"] } });
    });

    it("applies denylist BEFORE reverse alias (matches the backend name)", () => {
      expect(
        parseSearchParams("?filter[is_admin]=true", {
          aliases: { isAdmin: "is_admin" },
          excludeKeys: ["is_admin"],
        }),
      ).toEqual({});
    });
  });
});
