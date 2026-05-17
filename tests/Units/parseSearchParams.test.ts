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
        allowed: { params: ["locale", "tenant"] },
      }),
    ).toEqual({ params: { locale: ["es"], tenant: ["acme"] } });
  });

  describe("malformed URL keys", () => {
    it("ignores filter[a][b] (nested brackets are not part of the protocol)", () => {
      expect(
        parseSearchParams("?filter[a][b]=x&filter[status]=active"),
      ).toEqual({ filters: [{ attribute: "status", value: ["active"] }] });
    });

    it("ignores fields[a][b] the same way", () => {
      expect(parseSearchParams("?fields[user][nested]=name&fields=id")).toEqual(
        { fields: ["id"] },
      );
    });
  });

  describe("repeated URL params (?sort=a&sort=b)", () => {
    it("accumulates sort entries the same way as the CSV form", () => {
      // ?sort=name&sort=-created_at  is equivalent in result to
      // ?sort=name,-created_at — both produce two sort entries.
      expect(parseSearchParams("?sort=name&sort=-created_at")).toEqual({
        sorts: [
          { attribute: "name", direction: "asc" },
          { attribute: "created_at", direction: "desc" },
        ],
      });
    });

    it("accumulates include entries across repeated params", () => {
      expect(parseSearchParams("?include=author&include=tags")).toEqual({
        includes: ["author", "tags"],
      });
    });

    it("treats the same filter key twice as two separate filter entries", () => {
      expect(
        parseSearchParams("?filter[status]=active&filter[status]=pending"),
      ).toEqual({
        filters: [
          { attribute: "status", value: ["active"] },
          { attribute: "status", value: ["pending"] },
        ],
      });
    });
  });

  it("accepts an externally pre-compiled policy as the 3rd argument", async () => {
    const { compilePolicy } = await import("@/utils/searchParamsPolicy");
    const policy = compilePolicy({ allowed: { filters: ["status"] } });
    expect(
      parseSearchParams(
        "?filter[status]=active&filter[is_admin]=true",
        undefined,
        policy,
      ),
    ).toEqual({ filters: [{ attribute: "status", value: ["active"] }] });
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

  describe("allowed (allowlist per bucket)", () => {
    it("undefined bucket → default behavior (allow-all for filters/sorts/etc, deny-all for params)", () => {
      expect(
        parseSearchParams("?filter[anything]=x&sort=anything&locale=es"),
      ).toEqual({
        filters: [{ attribute: "anything", value: ["x"] }],
        sorts: [{ attribute: "anything", direction: "asc" }],
        // locale dropped because allowed.params is undefined (deny-all)
      });
    });

    it("defined bucket → only listed entries pass", () => {
      expect(
        parseSearchParams(
          "?filter[status]=active&filter[is_admin]=true&filter[role]=admin",
          { allowed: { filters: ["status", "role"] } },
        ),
      ).toEqual({
        filters: [
          { attribute: "status", value: ["active"] },
          { attribute: "role", value: ["admin"] },
        ],
      });
    });

    it("allowlists are independent per bucket", () => {
      expect(
        parseSearchParams("?filter[name]=x&sort=name&sort=created_at", {
          allowed: { filters: ["name"], sorts: ["created_at"] },
        }),
      ).toEqual({
        filters: [{ attribute: "name", value: ["x"] }],
        sorts: [{ attribute: "created_at", direction: "asc" }],
      });
    });

    it("includes allowlist filters incoming relations", () => {
      expect(
        parseSearchParams("?include=author,secret_log,tags", {
          allowed: { includes: ["author", "tags"] },
        }),
      ).toEqual({ includes: ["author", "tags"] });
    });

    it("fields allowlist matches both short prop and entity.prop forms", () => {
      expect(
        parseSearchParams(
          "?fields=id,password&fields[user]=name,email,password",
          { allowed: { fields: ["id", "name", "user.email"] } },
        ),
      ).toEqual({ fields: ["id", "user.name", "user.email"] });
    });

    it("excludeKeys still wins when both are set on the same bucket", () => {
      expect(
        parseSearchParams("?filter[name]=x&filter[status]=y&filter[role]=z", {
          allowed: { filters: ["name", "status", "role"] },
          excludeKeys: { filters: ["status"] },
        }),
      ).toEqual({
        filters: [
          { attribute: "name", value: ["x"] },
          { attribute: "role", value: ["z"] },
        ],
      });
    });
  });

  describe("policy is alias-aware (matches both frontend and backend names)", () => {
    const aliases = { userName: "name", adminFlag: "is_admin" };

    it("DX: allowed.filters with FRONTEND name hydrates a URL with backend name", () => {
      // Dev writes the name they think in (frontend), URL has the wire name.
      expect(
        parseSearchParams("?filter[name]=John", {
          aliases,
          allowed: { filters: ["userName"] },
        }),
      ).toEqual({ filters: [{ attribute: "userName", value: ["John"] }] });
    });

    it("DX: allowed.filters with BACKEND name also works (existing behaviour)", () => {
      expect(
        parseSearchParams("?filter[name]=John", {
          aliases,
          allowed: { filters: ["name"] },
        }),
      ).toEqual({ filters: [{ attribute: "userName", value: ["John"] }] });
    });

    it("security: excludeKeys.filters with backend name blocks attacker using FRONTEND name", () => {
      // Attacker tries to bypass `is_admin` denylist by using the alias key.
      expect(
        parseSearchParams("?filter[adminFlag]=true", {
          aliases,
          excludeKeys: { filters: ["is_admin"] },
        }),
      ).toEqual({});
    });

    it("security: excludeKeys.filters with frontend name still blocks backend URL form", () => {
      expect(
        parseSearchParams("?filter[is_admin]=true", {
          aliases,
          excludeKeys: { filters: ["adminFlag"] },
        }),
      ).toEqual({});
    });

    it("sorts get the same dual-name treatment", () => {
      expect(
        parseSearchParams("?sort=-name", {
          aliases,
          allowed: { sorts: ["userName"] },
        }),
      ).toEqual({ sorts: [{ attribute: "userName", direction: "desc" }] });

      expect(
        parseSearchParams("?sort=adminFlag", {
          aliases,
          excludeKeys: { sorts: ["is_admin"] },
        }),
      ).toEqual({});
    });
  });

  describe("excludeKeys (defense in depth, per bucket)", () => {
    it("only blocks within the bucket it is declared for", () => {
      // 'password' is dangerous as a filter but legitimate as a field
      expect(
        parseSearchParams(
          "?filter[password]=anything&fields[user]=name,password",
          { excludeKeys: { filters: ["password"] } },
        ),
      ).toEqual({ fields: ["user.name", "user.password"] });
    });

    it("drops filters in the filters bucket only", () => {
      expect(
        parseSearchParams("?filter[is_admin]=true&filter[status]=active", {
          excludeKeys: { filters: ["is_admin"] },
        }),
      ).toEqual({ filters: [{ attribute: "status", value: ["active"] }] });
    });

    it("drops sorts and includes via their own bucket lists", () => {
      expect(
        parseSearchParams("?sort=-is_admin,name&include=secret,user", {
          excludeKeys: {
            sorts: ["is_admin"],
            includes: ["secret"],
          },
        }),
      ).toEqual({
        sorts: [{ attribute: "name", direction: "asc" }],
        includes: ["user"],
      });
    });

    it("drops fields by short prop name or by entity.prop form", () => {
      expect(
        parseSearchParams(
          "?fields=id,password&fields[user]=name,password&fields[admin]=role",
          { excludeKeys: { fields: ["password", "admin.role"] } },
        ),
      ).toEqual({ fields: ["id", "user.name"] });
    });

    it("params bucket: excludeKeys overrides the allowlist", () => {
      expect(
        parseSearchParams("?locale=es&secret=leak", {
          allowed: { params: ["locale", "secret"] },
          excludeKeys: { params: ["secret"] },
        }),
      ).toEqual({ params: { locale: ["es"] } });
    });

    it("matches the raw backend name BEFORE reverse alias", () => {
      expect(
        parseSearchParams("?filter[is_admin]=true", {
          aliases: { isAdmin: "is_admin" },
          excludeKeys: { filters: ["is_admin"] },
        }),
      ).toEqual({});
    });

    it("does not leak across buckets (sorts list does not affect filters)", () => {
      expect(
        parseSearchParams("?filter[name]=x&sort=name", {
          excludeKeys: { sorts: ["name"] },
        }),
      ).toEqual({ filters: [{ attribute: "name", value: ["x"] }] });
    });
  });
});
