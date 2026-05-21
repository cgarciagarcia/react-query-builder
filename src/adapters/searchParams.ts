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
import { compilePolicy, type PolicyGate } from "@/utils/searchParamsPolicy";
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
    key === "page" ||
    key === "limit" ||
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
  policy: PolicyGate,
): ((state: GlobalState<A>) => void) => {
  const sync = options.sync;
  // The Builder fires `write(state)` once on mount (to normalise the URL
  // bar against the final state) and then on every mutation. The first
  // call always uses `replaceState`, even when `sync === "push"`, so the
  // mount-time normalisation doesn't add a phantom back-button entry —
  // subsequent mutations honour the configured mode.
  let isFirstCall = true;
  return (state) => {
    const firstCall = isFirstCall;
    isFirstCall = false;

    const serialized = serializeSearchParams<A>(state, options, policy);

    if (typeof sync === "function") {
      sync(serialized);
      return;
    }

    const next = mergeManagedSearch(defaultSource(), serialized, options);
    const mode = !firstCall && sync === "push" ? "push" : "replace";
    writeToHistory(next, mode);
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
 *
 * To use different names in the URL than what the API expects, set
 * `urlAliases` here and `BaseConfig.aliases` on the builder independently:
 *
 * ```ts
 * useQueryBuilder({
 *   aliases: { dni: "code" },          // state → backend (for .build())
 *   adapter: createSearchParamsAdapter({
 *     sync: true,
 *     urlAliases: { dni: "documento" }, // state → URL (for the URL bar)
 *   }),
 * });
 * ```
 */
export const createSearchParamsAdapter = <
  Aliases extends Record<string, string> | undefined = undefined,
>(
  options?: SearchParamsAdapterOptions,
): QueryBuilderAdapter<Aliases> => {
  // Compile the allow/deny policy once at adapter creation. `options` is
  // immutable for the adapter's lifetime, so the resulting gate is reused
  // on every read AND every write — keeping the hot path (write fires on
  // each mutation) free of repeated Set construction.
  const policy = compilePolicy(options);

  const adapter: QueryBuilderAdapter<Aliases> = {
    read(context?: AdapterReadContext<Aliases>): Partial<GlobalState<Aliases>> {
      const source = options?.source ?? defaultSource;
      // Explicit `urlAliases` wins. Otherwise the URL namespace inherits
      // the builder's `aliases` — so by default URL and backend share
      // the same naming, which is the common case.
      const urlAliases = options?.urlAliases ?? context?.aliases;
      return parseSearchParams<Aliases>(
        source(),
        { ...options, urlAliases },
        policy,
      );
    },
  };

  if (options?.sync !== undefined) {
    adapter.write = makeWriter<Aliases>(options, policy);
  }

  return adapter;
};
