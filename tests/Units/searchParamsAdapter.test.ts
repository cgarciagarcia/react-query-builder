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
});
