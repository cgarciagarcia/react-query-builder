// @vitest-environment happy-dom
import { createSearchParamsAdapter } from "@/adapters/searchParams";
import { useQueryBuilder } from "@/hooks/useQueryBuilder";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("useQueryBuilder", () => {
  it("should return a QueryBuilder instance with empty state", () => {
    const { result } = renderHook(() => useQueryBuilder());

    expect(result.current.build()).toBe("");
  });

  it("should apply initial config", () => {
    const { result } = renderHook(() =>
      useQueryBuilder({
        filters: [{ attribute: "status", value: ["active"] }],
      }),
    );

    expect(result.current.build()).toBe("?filter[status]=active");
  });

  it("should re-render when state changes", () => {
    const { result } = renderHook(() => useQueryBuilder());

    act(() => {
      result.current.filter("name", "John");
    });

    expect(result.current.build()).toBe("?filter[name]=John");
  });

  it("should persist builder instance across re-renders", () => {
    const { result, rerender } = renderHook(() => useQueryBuilder());
    const firstInstance = result.current;

    rerender();

    expect(result.current).toBe(firstInstance);
  });

  it("should accumulate state across multiple mutations", () => {
    const { result } = renderHook(() => useQueryBuilder());

    act(() => {
      result.current.filter("status", "active").sort("name").page(2);
    });

    expect(result.current.build()).toBe(
      "?filter[status]=active&sort=name&page=2",
    );
  });

  it("should reflect state removal", () => {
    const { result } = renderHook(() => useQueryBuilder());

    act(() => {
      result.current.filter("name", "John").filter("status", "active");
    });

    act(() => {
      result.current.removeFilter("name");
    });

    expect(result.current.build()).toBe("?filter[status]=active");
  });

  it("should invoke adapter.read exactly once across re-renders", () => {
    const read = vi.fn(() => ({
      filters: [{ attribute: "status", value: ["active"] }],
    }));

    const { result, rerender } = renderHook(() =>
      useQueryBuilder({ adapter: { read } }),
    );

    rerender();
    rerender();

    expect(read).toHaveBeenCalledTimes(1);
    expect(result.current.build()).toBe("?filter[status]=active");
  });

  it("should let explicit config win over adapter.read", () => {
    const { result } = renderHook(() =>
      useQueryBuilder({
        adapter: {
          read: () => ({
            filters: [{ attribute: "status", value: ["from-adapter"] }],
          }),
        },
        filters: [{ attribute: "status", value: ["from-config"] }],
      }),
    );

    expect(result.current.build()).toBe("?filter[status]=from-config");
  });

  it("should hydrate via createSearchParamsAdapter with custom keys", () => {
    const adapter = createSearchParamsAdapter({
      source: () =>
        "?filt[status]=active&srt=-name&inc=user&fld[user]=id,email&locale=es",
      keys: { filter: "filt", sort: "srt", include: "inc", fields: "fld" },
      allowed: { params: ["locale"] },
    });

    const { result } = renderHook(() => useQueryBuilder({ adapter }));

    expect(result.current.build()).toBe(
      "?filter[status]=active&fields[user]=id,email&sort=-name&include=user&locale=es",
    );
  });

  it("should call adapter.write once on mount and on every state mutation", () => {
    const write = vi.fn();
    const { result } = renderHook(() =>
      useQueryBuilder({ adapter: { read: () => ({}), write } }),
    );

    // First call fires at construction to normalise the external source
    // against the final state (defaults, urlOmit, etc.).
    expect(write).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.filter("status", "active");
    });
    act(() => {
      result.current.sort("name");
    });

    // +1 per mutation.
    expect(write).toHaveBeenCalledTimes(3);
    expect(write).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: [{ attribute: "status", value: ["active"] }],
        sorts: [{ attribute: "name", direction: "asc" }],
      }),
    );
  });

  it("should work with aliases", () => {
    const { result } = renderHook(() =>
      useQueryBuilder<{ name: "full_name" }>({
        aliases: { name: "full_name" },
      }),
    );

    act(() => {
      result.current.filter("name", "John");
    });

    expect(result.current.build()).toBe("?filter[full_name]=John");
  });
});
