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
        { keys: { filter: "filt", sort: "srt", include: "inc", fields: "fld" } },
      ),
    ).toBe("filt[status]=active&fld[user]=id&srt=-name&inc=user");
  });

  it("writes only allowlisted params; drops the rest", () => {
    expect(
      serializeSearchParams(
        { params: { locale: ["es"], tenant: ["acme"], secret: ["leak"] } },
        { allowedParams: ["locale", "tenant"] },
      ),
    ).toBe("locale=es&tenant=acme");
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
      allowedParams: ["locale"],
    });
    expect(parseSearchParams(serialized, { allowedParams: ["locale"] })).toEqual(
      state,
    );
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
