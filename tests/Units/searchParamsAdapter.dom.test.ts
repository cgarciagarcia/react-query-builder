// @vitest-environment happy-dom
import { createSearchParamsAdapter } from "@/adapters/searchParams";
import { afterEach, describe, expect, it } from "vitest";

describe("createSearchParamsAdapter (browser env)", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("reads from window.location.search when no source is given", () => {
    window.history.replaceState(null, "", "/?filter[status]=active&sort=-name");
    const adapter = createSearchParamsAdapter();

    expect(adapter.read()).toEqual({
      filters: [{ attribute: "status", value: ["active"] }],
      sorts: [{ attribute: "name", direction: "desc" }],
    });
  });

  it("re-reads window.location.search on every read() call", () => {
    const adapter = createSearchParamsAdapter();

    window.history.replaceState(null, "", "/?filter[status]=active");
    expect(adapter.read()).toEqual({
      filters: [{ attribute: "status", value: ["active"] }],
    });

    window.history.replaceState(null, "", "/?filter[status]=archived");
    expect(adapter.read()).toEqual({
      filters: [{ attribute: "status", value: ["archived"] }],
    });
  });
});
