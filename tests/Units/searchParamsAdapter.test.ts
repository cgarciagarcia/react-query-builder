import { createSearchParamsAdapter } from "@/adapters/searchParams";
import { describe, expect, it, vi } from "vitest";

describe("createSearchParamsAdapter", () => {
  it("does not call source until read() is invoked", () => {
    const source = vi.fn(() => "?filter[status]=active");
    const adapter = createSearchParamsAdapter({ source });

    expect(source).not.toHaveBeenCalled();
    adapter.read();
    expect(source).toHaveBeenCalledTimes(1);
  });

  it("forwards source, keys, and allowedParams to the parser", () => {
    const adapter = createSearchParamsAdapter({
      source: () => "?filt[status]=active&locale=es&unwanted=1",
      keys: { filter: "filt" },
      allowedParams: ["locale"],
    });

    expect(adapter.read()).toEqual({
      filters: [{ attribute: "status", value: ["active"] }],
      params: { locale: ["es"] },
    });
  });

  it("returns {} when no source is given and window is unavailable (SSR/node)", () => {
    expect(createSearchParamsAdapter().read()).toEqual({});
  });

  it("does not expose write() unless sync is configured", () => {
    expect(createSearchParamsAdapter().write).toBeUndefined();
    expect(
      createSearchParamsAdapter({ source: () => "" }).write,
    ).toBeUndefined();
  });

  it("invokes a custom sync callback with the serialised search string", () => {
    const sync = vi.fn();
    const adapter = createSearchParamsAdapter<Record<string, string>>({
      keys: { filter: "filt" },
      allowedParams: ["locale"],
      sync,
    });

    expect(adapter.write).toBeDefined();
    adapter.write?.({
      aliases: {},
      filters: [{ attribute: "status", value: ["active"] }],
      includes: [],
      sorts: [],
      fields: [],
      params: { locale: ["es"], dropped: ["x"] },
      pruneConflictingFilters: {},
      delimiters: {
        global: ",",
        fields: null,
        filters: null,
        sorts: null,
        includes: null,
        params: null,
      },
      useQuestionMark: true,
      pagination: {},
    });

    expect(sync).toHaveBeenCalledTimes(1);
    expect(sync).toHaveBeenCalledWith("filt[status]=active&locale=es");
  });

  it("default writer is a no-op when window is unavailable (SSR/node)", () => {
    const adapter = createSearchParamsAdapter<Record<string, string>>({
      sync: true,
    });
    expect(() =>
      adapter.write?.({
        aliases: {},
        filters: [{ attribute: "status", value: ["active"] }],
        includes: [],
        sorts: [],
        fields: [],
        params: {},
        pruneConflictingFilters: {},
        delimiters: {
          global: ",",
          fields: null,
          filters: null,
          sorts: null,
          includes: null,
          params: null,
        },
        useQuestionMark: true,
        pagination: {},
      }),
    ).not.toThrow();
  });
});
