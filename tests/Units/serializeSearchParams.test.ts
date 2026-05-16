import { type GlobalState } from "@/types";
import { serializeSearchParams } from "@/utils/serializeSearchParams";
import { describe, expect, it } from "vitest";

describe("serializeSearchParams", () => {
  it("returns an empty string for empty state", () => {
    expect(serializeSearchParams({})).toBe("");
  });

  it.each<[string, Partial<GlobalState>, string]>([
    [
      "filters with single and multi-value",
      {
        filters: [
          { attribute: "status", value: ["active", "pending"] },
          { attribute: "name", value: ["John"] },
        ],
      },
      "filter[status]=active,pending&filter[name]=John",
    ],
    [
      "filters with operator prefixes",
      {
        filters: [
          { attribute: "age", value: ["18"], operator: ">=" },
          { attribute: "score", value: ["0"], operator: "<>" },
        ],
      },
      "filter[age]=>=18&filter[score]=<>0",
    ],
    [
      "filter with equals operator omits the prefix",
      { filters: [{ attribute: "x", value: ["1"], operator: "=" }] },
      "filter[x]=1",
    ],
    [
      "sort with mixed directions",
      {
        sorts: [
          { attribute: "created_at", direction: "desc" },
          { attribute: "name", direction: "asc" },
        ],
      },
      "sort=-created_at,name",
    ],
    ["include into csv", { includes: ["user", "team"] }, "include=user,team"],
    [
      "bare and dotted fields collapsed to bracketed groups",
      { fields: ["id", "user.name", "user.email"] },
      "fields=id&fields[user]=name,email",
    ],
  ])("serialises %s", (_label, state, expected) => {
    expect(serializeSearchParams(state)).toBe(expected);
  });

  it("honours custom URL keys", () => {
    expect(
      serializeSearchParams(
        {
          filters: [{ attribute: "status", value: ["active"] }],
          sorts: [{ attribute: "name", direction: "desc" }],
          includes: ["user"],
          fields: ["user.id"],
        },
        {
          keys: { filter: "filt", sort: "srt", include: "inc", fields: "fld" },
        },
      ),
    ).toBe("filt[status]=active&fld[user]=id&srt=-name&inc=user");
  });

  it("writes only allowlisted params; drops the rest", () => {
    expect(
      serializeSearchParams(
        { params: { locale: ["es"], tenant: ["acme"], secret: ["leak"] } },
        { allowed: { params: ["locale", "tenant"] } },
      ),
    ).toBe("locale=es&tenant=acme");
  });

  describe("writer respects allowed + excludeKeys (symmetric with reader)", () => {
    it("drops filters not in allowed.filters", () => {
      expect(
        serializeSearchParams(
          {
            filters: [
              { attribute: "status", value: ["active"] },
              { attribute: "is_admin", value: ["true"] },
            ],
          },
          { allowed: { filters: ["status"] } },
        ),
      ).toBe("filter[status]=active");
    });

    it("drops sorts/includes/fields not in their bucket allowlist", () => {
      expect(
        serializeSearchParams(
          {
            sorts: [
              { attribute: "name", direction: "asc" },
              { attribute: "secret", direction: "asc" },
            ],
            includes: ["user", "internal_log"],
            fields: ["id", "password"],
          },
          {
            allowed: {
              sorts: ["name"],
              includes: ["user"],
              fields: ["id"],
            },
          },
        ),
      ).toBe("fields=id&sort=name&include=user");
    });

    it("excludeKeys drops on write across all buckets", () => {
      expect(
        serializeSearchParams(
          {
            filters: [
              { attribute: "name", value: ["x"] },
              { attribute: "is_admin", value: ["true"] },
            ],
            sorts: [
              { attribute: "name", direction: "asc" },
              { attribute: "secret_score", direction: "desc" },
            ],
            includes: ["user", "internal_log"],
            params: { locale: ["es"], debug: ["1"] },
          },
          {
            allowed: { params: ["locale", "debug"] },
            excludeKeys: {
              filters: ["is_admin"],
              sorts: ["secret_score"],
              includes: ["internal_log"],
              params: ["debug"],
            },
          },
        ),
      ).toBe("filter[name]=x&sort=name&include=user&locale=es");
    });

    it("excludeKeys wins over allowed when both are set", () => {
      expect(
        serializeSearchParams(
          {
            filters: [
              { attribute: "name", value: ["x"] },
              { attribute: "status", value: ["y"] },
            ],
          },
          {
            allowed: { filters: ["name", "status"] },
            excludeKeys: { filters: ["status"] },
          },
        ),
      ).toBe("filter[name]=x");
    });

    it("allowed.fields filters bracketed (entity.prop) fields too", () => {
      expect(
        serializeSearchParams(
          { fields: ["user.id", "user.password", "admin.role"] },
          { allowed: { fields: ["user.id", "admin.role"] } },
        ),
      ).toBe("fields[user]=id&fields[admin]=role");
    });

    it("applies excludeKeys to fields by short prop or entity.prop", () => {
      expect(
        serializeSearchParams(
          { fields: ["id", "user.password", "user.name", "admin.password"] },
          { excludeKeys: { fields: ["password"] } },
        ),
      ).toBe("fields=id&fields[user]=name");
    });
  });

  it("round-trips with parseSearchParams for the canonical case", async () => {
    const { parseSearchParams } = await import("@/utils/parseSearchParams");
    const state: Partial<GlobalState> = {
      filters: [{ attribute: "status", value: ["active"] }],
      sorts: [{ attribute: "name", direction: "desc" }],
      includes: ["user"],
      fields: ["user.id", "user.email"],
      params: { locale: ["es"] },
    };
    const serialized = serializeSearchParams(state, {
      allowed: { params: ["locale"] },
    });
    expect(
      parseSearchParams(serialized, { allowed: { params: ["locale"] } }),
    ).toEqual(state);
  });

  describe("aliases (forward map)", () => {
    it("rewrites filter and sort attributes from frontend → backend via options", () => {
      expect(
        serializeSearchParams(
          {
            filters: [{ attribute: "userName", value: ["John"] }],
            sorts: [{ attribute: "createdAt", direction: "desc" }],
          },
          { aliases: { userName: "name", createdAt: "created_at" } },
        ),
      ).toBe("filter[name]=John&sort=-created_at");
    });

    it("falls back to state.aliases when options.aliases is absent", () => {
      expect(
        serializeSearchParams<{ userName: "name" }>({
          aliases: { userName: "name" },
          filters: [{ attribute: "userName", value: ["John"] }],
        }),
      ).toBe("filter[name]=John");
    });

    it("round-trips through parseSearchParams with aliases on both ends", async () => {
      const { parseSearchParams } = await import("@/utils/parseSearchParams");
      const aliases = { userName: "name", createdAt: "created_at" };
      const state = {
        filters: [{ attribute: "userName", value: ["John"] }],
        sorts: [{ attribute: "createdAt", direction: "desc" as const }],
      };
      const url = serializeSearchParams(state, { aliases });
      expect(parseSearchParams(url, { aliases })).toEqual(state);
    });
  });
});
