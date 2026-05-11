// @vitest-environment happy-dom
import { createSearchParamsAdapter } from "@/adapters/searchParams";
import { afterEach, describe, expect, it } from "vitest";

describe("createSearchParamsAdapter (browser env)", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("falls back to window.location.search on every read() when no source is given", () => {
    const adapter = createSearchParamsAdapter();

    window.history.replaceState(null, "", "/?filter[status]=active&sort=-name");
    expect(adapter.read()).toEqual({
      filters: [{ attribute: "status", value: ["active"] }],
      sorts: [{ attribute: "name", direction: "desc" }],
    });

    // Re-read picks up the new URL — proving the default source is re-evaluated.
    window.history.replaceState(null, "", "/?filter[status]=archived");
    expect(adapter.read()).toEqual({
      filters: [{ attribute: "status", value: ["archived"] }],
    });
  });
});
