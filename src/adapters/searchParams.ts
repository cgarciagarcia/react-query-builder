import {
  type AdapterReadContext,
  type GlobalState,
  type QueryBuilderAdapter,
  type SearchParamsAdapterOptions,
} from "@/types";
import {
  DEFAULT_URL_KEYS,
  parseSearchParams,
  prettifyBrackets,
} from "@/utils/parseSearchParams";
import { serializeSearchParams } from "@/utils/serializeSearchParams";

const defaultSource = (): string =>
  typeof window === "undefined" ? "" : window.location.search;

const isManagedKey = (
  key: string,
  options: SearchParamsAdapterOptions,
): boolean => {
  const keys = { ...DEFAULT_URL_KEYS, ...(options.keys ?? {}) };
  const managedParams = options.allowed?.params ?? [];
  return (
    key === keys.filter ||
    key.startsWith(`${keys.filter}[`) ||
    key === keys.fields ||
    key.startsWith(`${keys.fields}[`) ||
    key === keys.sort ||
    key === keys.include ||
    managedParams.includes(key)
  );
};

const mergeManagedSearch = (
  currentSearch: string,
  nextSerialized: string,
  options: SearchParamsAdapterOptions,
): string => {
  const merged = new URLSearchParams(currentSearch);
  for (const key of [...merged.keys()]) {
    if (isManagedKey(key, options)) merged.delete(key);
  }
  for (const [k, v] of new URLSearchParams(nextSerialized).entries()) {
    merged.append(k, v);
  }
  const raw = merged.toString();
  return raw ? "?" + prettifyBrackets(raw) : "";
};

const writeToHistory = (search: string, mode: "replace" | "push"): void => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.search = search;
  const method = mode === "push" ? "pushState" : "replaceState";
  window.history[method](null, "", url);
};

const makeWriter = <A extends Record<string, string> | undefined = undefined>(
  options: SearchParamsAdapterOptions,
): ((state: GlobalState<A>) => void) => {
  const sync = options.sync;
  return (state) => {
    const serialized = serializeSearchParams<A>(state, options);
    if (typeof sync === "function") {
      sync(serialized);
      return;
    }
    const next = mergeManagedSearch(defaultSource(), serialized, options);
    writeToHistory(next, sync === "push" ? "push" : "replace");
  };
};

/**
 * Build a `QueryBuilderAdapter` that bridges the builder to a query string.
 *
 * - `read()` runs once on builder creation; by default it reads
 *   `window.location.search` (or whatever `source` returns) and parses it
 *   through `parseSearchParams`.
 * - `write(state)` is exposed **only when `sync` is set**. It serialises
 *   the state through `serializeSearchParams` and pushes it back to the URL
 *   (preserving any params not managed by this adapter), or hands it to a
 *   custom callback for router integration / debouncing.
 *
 * ```ts
 * const urlAdapter = createSearchParamsAdapter({
 *   keys: { filter: "filt", sort: "srt" },
 *   allowed: { params: ["locale"] },
 *   sync: true, // two-way binding via history.replaceState
 * });
 *
 * useQueryBuilder({ adapter: urlAdapter });
 * ```
 */
export const createSearchParamsAdapter = <
  Aliases extends Record<string, string> | undefined = undefined,
>(
  options?: SearchParamsAdapterOptions,
): QueryBuilderAdapter<Aliases> => {
  const adapter: QueryBuilderAdapter<Aliases> = {
    read(context?: AdapterReadContext<Aliases>): Partial<GlobalState<Aliases>> {
      const source = options?.source ?? defaultSource;
      const aliases = options?.aliases ?? context?.aliases;
      return parseSearchParams<Aliases>(source(), { ...options, aliases });
    },
  };

  if (options?.sync !== undefined) {
    adapter.write = makeWriter<Aliases>(options);
  }

  return adapter;
};
