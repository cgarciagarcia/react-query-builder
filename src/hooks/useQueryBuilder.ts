import { useRef, useState } from "react";
import { Builder } from "@/classes/Builder";
import { useMount } from "@/hooks/useMount";
import { type BaseConfig, type QueryBuilder } from "src/types";

/**
 * React hook that returns a stable `QueryBuilder` instance.
 *
 * **`config` is read only on the first render** (lazy initialization, same
 * semantics as `useState(() => init)`). The builder is then mutable through
 * its own methods (`builder.filter(...)`, etc.), and the instance is reused
 * across re-renders. Passing a different `config` on subsequent renders
 * does NOT rebuild the builder — if you need to react to a config change,
 * either mutate the builder directly or remount the component with a `key`.
 *
 * This applies equally to nested config fields like `adapter` — the adapter
 * passed on the first render is the one wired for the lifetime of the hook.
 */
export const useQueryBuilder = <
  Aliases extends Record<string, string> | undefined = undefined,
>(
  config?: BaseConfig<Aliases>,
): QueryBuilder<Aliases> => {
  const builder = useRef<Builder<Aliases> | null>(null);
  if (builder.current === null) {
    builder.current = new Builder<Aliases>(config);
  }

  const [, setReRendersCounter] = useState(0);

  useMount(() => {
    builder.current?.addSubscriber(() => {
      setReRendersCounter((r) => r + 1);
    });
  });

  return builder.current;
};
