import {
  type GlobalState,
  type QueryBuilderAdapter,
  type SearchParamsAdapterOptions,
} from "@/types";
import { parseSearchParams } from "@/utils/parseSearchParams";

const defaultSource = (): string =>
  typeof window === "undefined" ? "" : window.location.search;

/**
 * Build a `QueryBuilderAdapter` that hydrates the builder from a query
 * string. By default it reads `window.location.search`, but `source` can be
 * any callable that returns a query string (useful for SSR, tests, hash
 * routers, etc.).
 *
 * The adapter is meant to be composed with `useQueryBuilder`'s `initialState`
 * for lazy, one-time hydration:
 *
 * ```ts
 * const urlAdapter = createSearchParamsAdapter({
 *   keys: { filter: "filt", sort: "srt" },
 *   allowedParams: ["locale"],
 * });
 *
 * useQueryBuilder({ initialState: () => urlAdapter.read() });
 * ```
 */
export const createSearchParamsAdapter = <
  Aliases extends Record<string, string> | undefined = undefined,
>(
  options?: SearchParamsAdapterOptions,
): QueryBuilderAdapter<Aliases> => ({
  read(): Partial<GlobalState<Aliases>> {
    const source = options?.source ?? defaultSource;
    return parseSearchParams<Aliases>(source(), options);
  },
});
