// @vitest-environment happy-dom
import { useQueryBuilder } from "@/hooks/useQueryBuilder";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
