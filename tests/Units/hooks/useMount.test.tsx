// @vitest-environment happy-dom
import { useMount } from "@/hooks/useMount";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("useMount", () => {
  it("should call fn only once regardless of re-renders", () => {
    const fn = vi.fn();
    const { rerender } = renderHook(() => useMount(fn));

    rerender();
    rerender();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should not call fn again when deps change", () => {
    const fn = vi.fn();
    const { rerender } = renderHook(({ count }) => useMount(fn, [count]), {
      initialProps: { count: 0 },
    });

    rerender({ count: 1 });
    rerender({ count: 2 });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should call fn again when component remounts", () => {
    const fn = vi.fn();
    const { unmount, rerender } = renderHook(() => useMount(fn));

    rerender();
    unmount();

    renderHook(() => useMount(fn));

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
