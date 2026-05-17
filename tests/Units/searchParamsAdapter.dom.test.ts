// @vitest-environment happy-dom
import { createSearchParamsAdapter } from "@/adapters/searchParams";
import { type GlobalState } from "@/types";
import { afterEach, describe, expect, it, vi } from "vitest";

const fullState = <A extends Record<string, string> | undefined = undefined>(
  overrides: Partial<GlobalState<A>>,
): GlobalState<A> => ({
  aliases: {} as A,
  filters: [],
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
  ...overrides,
});

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

    window.history.replaceState(null, "", "/?filter[status]=archived");
    expect(adapter.read()).toEqual({
      filters: [{ attribute: "status", value: ["archived"] }],
    });
  });

  it("sync:true writes to history.replaceState and preserves unmanaged params", () => {
    window.history.replaceState(null, "", "/users?utm_source=newsletter");
    const adapter = createSearchParamsAdapter({
      allowed: { params: ["locale"] },
      sync: true,
    });

    adapter.write?.(
      fullState({
        filters: [{ attribute: "status", value: ["active"] }],
        params: { locale: ["es"] },
      }),
    );

    const params = new URLSearchParams(window.location.search);
    expect(params.get("filter[status]")).toBe("active");
    expect(params.get("locale")).toBe("es");
    expect(params.get("utm_source")).toBe("newsletter");
    expect(window.location.pathname).toBe("/users");
  });

  it("sync:'push' uses history.pushState for mutations but replaceState on first call", () => {
    const initialLength = window.history.length;
    const adapter = createSearchParamsAdapter({ sync: "push" });

    // First call is the mount-time normalisation — always replaceState,
    // even with sync:"push", so we don't add a phantom history entry.
    adapter.write?.(fullState({ filters: [{ attribute: "x", value: ["1"] }] }));
    expect(window.history.length).toBe(initialLength);
    expect(window.location.search).toContain("filter[x]=1");

    // Second call is a real mutation → pushState adds an entry.
    adapter.write?.(fullState({ filters: [{ attribute: "x", value: ["2"] }] }));
    expect(window.history.length).toBe(initialLength + 1);
    expect(window.location.search).toContain("filter[x]=2");
  });

  it("subsequent writes overwrite the previously managed keys", () => {
    const adapter = createSearchParamsAdapter({ sync: true });

    adapter.write?.(
      fullState({ filters: [{ attribute: "status", value: ["active"] }] }),
    );
    adapter.write?.(
      fullState({ filters: [{ attribute: "status", value: ["archived"] }] }),
    );

    expect(
      new URLSearchParams(window.location.search).getAll("filter[status]"),
    ).toEqual(["archived"]);
  });

  it("clears managed keys when state has nothing to write", () => {
    window.history.replaceState(
      null,
      "",
      "/?filter[status]=active&utm_source=x",
    );
    const adapter = createSearchParamsAdapter({ sync: true });

    adapter.write?.(fullState({}));

    expect(window.location.search).toBe("?utm_source=x");
  });

  it("strips the search entirely when nothing managed or unmanaged remains", () => {
    window.history.replaceState(null, "", "/?filter[x]=1");
    const adapter = createSearchParamsAdapter({ sync: true });

    adapter.write?.(fullState({}));

    expect(window.location.search).toBe("");
  });

  it("custom sync function receives the serialised search string", () => {
    const sync = vi.fn();
    const adapter = createSearchParamsAdapter({ sync });

    adapter.write?.(
      fullState({ filters: [{ attribute: "status", value: ["active"] }] }),
    );

    expect(sync).toHaveBeenCalledWith("filter[status]=active");
    expect(window.location.search).toBe(""); // custom callback bypasses default writer
  });
});
