export interface Sort<T> {
  attribute: T extends object ? (keyof T & string) | string : string;
  direction: "asc" | "desc";
}

export type Include = string;

export type FilterValue = (string | number)[] | string | number;

export const FilterOperator = {
  /** Exact match: `filter[field]=value` */
  Equals: "=",
  /** Less than: `filter[field][lt]=value` */
  LessThan: "<",
  /** Greater than: `filter[field][gt]=value` */
  GreaterThan: ">",
  /** Less than or equal: `filter[field][lte]=value` */
  LessThanOrEqual: "<=",
  /** Greater than or equal: `filter[field][gte]=value` */
  GreaterThanOrEqual: ">=",
  /** Not equal / distinct: `filter[field][neq]=value` */
  Distinct: "<>",
} as const;

export type OperatorType = (typeof FilterOperator)[keyof typeof FilterOperator];

export interface Filter<Al> {
  attribute: Al extends object ? (keyof Al & string) | string : string;
  value: (string | number)[];
  /** Filter comparison operator. Defaults to `FilterOperator.Equals` (`=`) when omitted. */
  operator?: OperatorType;
}

export type Field = string;

export type ConflictMap = Record<string, string[]>;

export interface GlobalState<Al = NonNullable<Record<string, string>>> {
  aliases: Al;
  fields: Field[];
  filters: Filter<Al>[];
  includes: Include[];
  sorts: Sort<Al>[];
  pruneConflictingFilters: ConflictMap;
  delimiters: {
    global: string;
    fields: string | null;
    filters: string | null;
    sorts: string | null;
    includes: string | null;
    params: string | null;
  };
  useQuestionMark: boolean;
  params: Record<string, (string | number)[]>;
  pagination?: {
    page?: number;
    limit?: number;
  };
}

export interface QueryBuilder<
  AliasType extends Record<string, string> | undefined =
    | Record<string, string>
    | undefined,
> {
  /**
   * Add or override a filter.
   *
   * @param attribute - The field name (or alias key) to filter on.
   * @param value - The filter value. Pass a `FilterOperator` here to use a
   *   custom comparison operator, then supply the actual value as the third
   *   argument.
   * @param override - When `value` is a `FilterOperator`, this is the real
   *   filter value. Otherwise pass `true` to replace an existing filter with
   *   the same attribute instead of adding a new one.
   *
   * @example Basic equality filter
   * builder.filter("status", "active")
   *
   * @example Operator filter
   * builder.filter("age", FilterOperator.GreaterThan, 18)
   *
   * @example Override existing filter
   * builder.filter("status", "inactive", true)
   */
  filter: <TFilter extends FilterValue>(
    attribute: AliasType extends object
      ? (keyof AliasType & string) | string
      : string,
    value: TFilter,
    ...override: TFilter extends OperatorType
      ? [override: FilterValue]
      : [override?: boolean]
  ) => QueryBuilder<AliasType>;
  removeFilter: (
    ...filtersToRemove: (AliasType extends object
      ? (keyof AliasType & string) | string
      : string)[]
  ) => QueryBuilder<AliasType>;
  clearFilters: () => QueryBuilder<AliasType>;
  include: (...includes: Include[]) => QueryBuilder<AliasType>;
  removeInclude: (...includesToRemove: Include[]) => QueryBuilder<AliasType>;
  clearIncludes: () => QueryBuilder<AliasType>;
  sort: (
    attribute: AliasType extends object
      ? (keyof AliasType & string) | string
      : string,
    direction?: "asc" | "desc",
  ) => QueryBuilder<AliasType>;
  removeSort: (
    ...attributeToRemove: (AliasType extends object
      ? (keyof AliasType & string) | string
      : string)[]
  ) => QueryBuilder<AliasType>;
  clearSorts: () => QueryBuilder<AliasType>;
  build: () => string;
  fields: (...fields: Field[]) => QueryBuilder<AliasType>;
  removeField: (...fieldsToRemove: Field[]) => QueryBuilder<AliasType>;
  clearFields: () => QueryBuilder<AliasType>;
  tap: (
    callback: (state: GlobalState<AliasType>) => void,
  ) => QueryBuilder<AliasType>;
  setParam: (
    key: string,
    value: (string | number)[] | string | number,
  ) => QueryBuilder<AliasType>;
  removeParam: (...paramsToRemove: string[]) => QueryBuilder<AliasType>;
  clearParams: () => QueryBuilder<AliasType>;
  when: (
    condition: boolean,
    callback: (state: GlobalState<AliasType>) => void,
  ) => QueryBuilder<AliasType>;
  toArray: () => string[];
  hasFilter: (
    ...attribute: (AliasType extends object
      ? keyof AliasType | string
      : string)[]
  ) => boolean;
  hasSort: (
    ...attribute: (AliasType extends object
      ? (keyof AliasType & string) | string
      : string)[]
  ) => boolean;
  hasInclude: (...includes: Include[]) => boolean;
  hasField: (...fields: Field[]) => boolean;
  hasParam: (...key: string[]) => boolean;
  page: (page: number) => QueryBuilder<AliasType>;
  limit: (limit: number) => QueryBuilder<AliasType>;
  nextPage: () => QueryBuilder<AliasType>;
  previousPage: () => QueryBuilder<AliasType>;
  getCurrentPage: () => number | undefined;
  getLimit: () => number | undefined;
}

/**
 * URL keys recognized by the built-in `parseSearchParams` and
 * `createSearchParamsAdapter`. Consumers can remap any of these to a custom
 * key (e.g. `filter` -> `filt`) while reading from the URL.
 */
export type ConfigurableURLKey = "filter" | "sort" | "include" | "fields";

/**
 * Entry accepted by `urlOmit` bucket lists. Either a plain attribute name
 * or the wildcard `"*"`, which omits every entry in that bucket.
 *
 * The `(string & {})` half is a TypeScript trick that keeps the `"*"`
 * literal visible in IDE autocomplete while still allowing any string
 * value — without it, TS collapses the union to plain `string` and the
 * wildcard suggestion never surfaces.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type UrlOmitEntry = "*" | (string & {});

/**
 * Options for the built-in URL adapter / parser / serializer.
 *
 * ## Known protocol limitations
 *
 * Filter values **must not** contain any of these characters; the URL
 * protocol uses them as control symbols and a round-trip through the
 * adapter would silently corrupt the value:
 *
 * - `,` — the multi-value separator (`filter[tag]=a,b` → `["a", "b"]`).
 * - `<`, `>`, `<=`, `>=`, `<>` as the **leading** characters of a value —
 *   they are parsed as operator prefixes (`filter[age]=>=18` → operator
 *   `>=`, value `["18"]`).
 *
 * Values containing `%`, `&`, `+` and spaces ARE safe — they go through the
 * URL escaped and survive the round-trip intact.
 */
export interface SearchParamsAdapterOptions {
  /**
   * Remap the URL keys the parser looks for. Any omitted key falls back to
   * its default (`filter`, `sort`, `include`, `fields`).
   */
  keys?: Partial<Record<ConfigurableURLKey, string>>;
  /**
   * `state → URL` attribute mapping for the URL namespace **only**. The
   * key is the name you use in your code (`builder.filter('dni', …)`),
   * the value is what shows up in the URL bar.
   *
   * This is intentionally **separate from `BaseConfig.aliases`** (which
   * maps `state → backend` and drives `.build()`). The split lets the URL
   * speak the user's language while the backend keeps its own technical
   * names — see "Different names for URL and backend" in the URL Adapter
   * docs.
   *
   * Resolution at runtime:
   * - If `urlAliases` is set here → use it verbatim.
   * - If omitted → fall back to the builder's `aliases` (passed in via
   *   `read({ aliases })`), so URL and backend share the same naming by
   *   default (the common case).
   * - Pass `urlAliases: {}` to explicitly opt out of any translation —
   *   the URL then mirrors the state-space names.
   *
   * The reader builds the reverse map internally, so you only declare the
   * `state → URL` direction once.
   */
  urlAliases?: Record<string, string>;
  /**
   * Bucket-scoped allowlist. **When a bucket is defined**, only entries
   * matching the list pass through (both on read AND on write — for
   * round-trip safety). **When omitted**, the bucket's default behavior
   * applies:
   *
   * - `filters` / `sorts` / `includes` / `fields` → default allow-all
   *   (the whole point of the feature is URL-driven filtering, so being
   *   strict by default would require enumerating every legal attribute).
   * - `params` → default deny-all (params are arbitrary app-specific data;
   *   if you do not declare it, it does not enter).
   *
   * For `filters` and `sorts`, when `aliases` are present the policy is
   * **alias-aware**: an entry matches if **either** the URL-side name
   * (backend / wire) OR its aliased counterpart (frontend / state) is in
   * the list. You can write your allowlist in whichever vocabulary you
   * think in:
   *
   * ```ts
   * aliases: { userName: "name" },
   * allowed: { filters: ["userName"] }   // works
   * // — or —
   * allowed: { filters: ["name"] }       // also works
   * ```
   *
   * ```ts
   * allowed: {
   *   filters:  ["status", "role", "created_at"],
   *   sorts:    ["created_at", "name"],
   *   includes: ["author", "tags"],
   *   fields:   ["id", "title", "user.name"],
   *   params:   ["locale", "tenant"],
   * }
   * ```
   *
   * Combine with `excludeKeys` (denylist) for layered defense: `allowed`
   * narrows the input set, `excludeKeys` removes specific entries from
   * what remains.
   */
  allowed?: {
    filters?: string[];
    sorts?: string[];
    includes?: string[];
    fields?: string[];
    params?: string[];
  };
  /**
   * Defense-in-depth denylist, **scoped per bucket**. Each list drops the
   * matching names from the corresponding bucket on read AND on write;
   * `params` wins over `allowed.params` (deny over allow).
   *
   * For `filters` and `sorts`, the check is **alias-aware**: an entry is
   * dropped if **either** the URL name OR its aliased counterpart is in
   * the list. This closes the bypass where an attacker uses the frontend
   * alias key in the URL (`?filter[adminFlag]=true`) to defeat a denylist
   * declared with the backend name (`excludeKeys.filters: ["is_admin"]`)
   * — both names are checked, so listing either form blocks both.
   *
   * Per-bucket scoping is intentional: a name like `password` is dangerous
   * as a filter but legitimate as a `fields` entry (selecting the column).
   * Saying "deny `password` everywhere" would silently break legitimate
   * use cases.
   *
   * For `fields`, both the short prop name (`password`) and the
   * fully-qualified `entity.prop` form (`user.password`) match — pick the
   * precision you need.
   *
   * ```ts
   * excludeKeys: {
   *   filters:  ["is_admin", "tenant_id"],
   *   includes: ["internal_audit_log"],
   *   sorts:    ["secret_score"],
   *   fields:   ["password", "api_token"],
   *   params:   ["debug"],
   * }
   * ```
   */
  excludeKeys?: {
    filters?: string[];
    sorts?: string[];
    includes?: string[];
    fields?: string[];
    params?: string[];
  };
  /**
   * Writer-only denylist: keep these entries in the builder state (so
   * `.build()` still emits them to the API) but **omit them from the URL
   * bar**. Per-bucket, alias-aware (matches both the state name and the
   * URL/wire name, so you can write your rule in whichever vocabulary).
   *
   * Use it when your backend needs context that the user doesn't care
   * about — typical case: relations or fields the API always requires
   * (`include=organization,permissions`) that would just clutter the
   * shareable link.
   *
   * ```ts
   * useQueryBuilder({
   *   includes: ["organization", "permissions"], // always sent to the API
   *   adapter: createSearchParamsAdapter({
   *     sync: true,
   *     urlOmit: { includes: ["organization", "permissions"] },
   *   }),
   * });
   * // .build() → ?include=organization,permissions&…   (backend gets them)
   * // URL bar   → ?…                                   (clean for the user)
   * ```
   *
   * Each list accepts plain attribute names AND the wildcard `"*"`,
   * which drops every entry in that bucket. Common case: hide all
   * `fields` from the URL because they're an internal API optimisation
   * the user doesn't care about (`urlOmit: { fields: ["*"] }`).
   *
   * The reader is **not** affected — if a malicious URL contains one of
   * these names, it still goes through the policy. Add the same names to
   * `excludeKeys` if you also want to refuse them on hydration.
   */
  urlOmit?: {
    filters?: UrlOmitEntry[];
    sorts?: UrlOmitEntry[];
    includes?: UrlOmitEntry[];
    fields?: UrlOmitEntry[];
    params?: UrlOmitEntry[];
  };
  /**
   * Lazy provider of the query string to parse. Default:
   * `() => window.location.search`. Evaluated when `read()` is called, not
   * at adapter-creation time, so it is safe to instantiate at module scope.
   */
  source?: () => string;
  /**
   * Enable two-way binding. When set, the adapter exposes a `write(state)`
   * function that the builder invokes on every mutation, serialising the
   * state back to the URL using the same `keys`, `allowed`, and
   * `excludeKeys` policy as the reader.
   *
   * - `true` (or `"replace"`) — `window.history.replaceState` (no extra
   *   history entry per change). Best for filter/sort UI.
   * - `"push"` — `window.history.pushState` (every change is a back-button
   *   step). Use for major navigation steps.
   * - `(search) => void` — full custom. Receives the serialised query string
   *   (no leading `?`). Use for router integrations (Next.js, React Router)
   *   or to add debouncing.
   *
   * Omit (or leave `undefined`) to keep the adapter read-only.
   *
   * The built-in writer preserves any query params not managed by this
   * adapter (i.e. not matching the configured keys and not in
   * `allowed.params`), so other consumers of the URL (analytics, locale
   * switchers, etc.) are left untouched.
   */
  sync?: true | "replace" | "push" | ((search: string) => void);
}

/**
 * Subset of the builder config passed to `QueryBuilderAdapter.read()` so
 * adapters can react to user-level options (e.g., aliases) without the
 * consumer having to declare them twice.
 */
export interface AdapterReadContext<
  Aliases extends Record<string, string> | undefined = undefined,
> {
  aliases?: Aliases;
}

/**
 * Strategy interface for any data source that can seed (and optionally
 * persist) the builder state. The built-in `createSearchParamsAdapter` reads
 * from `window.location.search`; custom adapters (hash router, react-router,
 * in-memory, localStorage, etc.) implement the same shape.
 */
export interface QueryBuilderAdapter<
  Aliases extends Record<string, string> | undefined = undefined,
> {
  /**
   * Called exactly once when the builder is created. The `context` argument
   * exposes builder-level config (currently `aliases`) so adapters can stay
   * aligned with the consumer's settings without duplicating them.
   */
  read: (
    context?: AdapterReadContext<Aliases>,
  ) => Partial<GlobalState<Aliases>>;
  /**
   * Optional. When defined, the builder invokes this:
   *
   * 1. **Once on mount**, right after `read()` has seeded and any
   *    `BaseConfig` overrides have been merged in. This "normalises" the
   *    external source (typically the URL bar) so it matches the builder's
   *    final state — useful when `BaseConfig.includes` defaults or
   *    `urlOmit` make the rendered state diverge from a stale URL the
   *    user landed on.
   * 2. **On every subsequent state change** — it's wired as an internal
   *    subscriber after the initial mount call.
   *
   * Custom adapters can guard against the mount call with a closure flag
   * if they don't want it (e.g. an adapter wrapping a router that would
   * loop on a redirect-on-mount). The built-in URL adapter already does
   * this: it forces `replaceState` on the first call regardless of the
   * configured `sync` mode (so `"push"` doesn't add a phantom history
   * entry), and skips the mount call entirely when `sync` is a custom
   * function (so the consumer's callback doesn't fire before any user
   * action).
   */
  write?: (state: GlobalState<Aliases>) => void;
}

export interface BaseConfig<
  AliasType extends Record<string, string> | undefined = undefined,
> {
  aliases?: AliasType;
  includes?: Include[];
  sorts?: Sort<AliasType>[];
  filters?: Filter<AliasType>[];
  fields?: Field[];
  /**
   * Bridge to an external source of state — typically a URL parser, but
   * anything implementing `QueryBuilderAdapter` works (localStorage, hash
   * router, in-memory store, etc.).
   *
   * - `adapter.read()` runs exactly once when the builder is created. Its
   *   return value seeds the initial state, behaving like the lazy form of
   *   `useState(() => ...)`.
   * - `adapter.write(state)` is optional. When defined, it is invoked on
   *   every state change so the external source can be kept in sync (e.g.
   *   `history.replaceState` for two-way URL binding).
   *
   * Precedence on seed: built-in defaults < `adapter.read()` < the rest of
   * `BaseConfig` (anything you set explicitly here always wins).
   */
  adapter?: QueryBuilderAdapter<AliasType>;
  /**
   * Create a map of filters that don't work together
   */
  pruneConflictingFilters?: ConflictMap;
  /**
   * Delimiters used in the query string as separator among values, the default value is "," ( comma )
   */
  delimiters?: Partial<{
    /**
     * The global delimiter is used as default for every delimiter
     */
    global: string;
    /**
     * Override the default delimiter for every field delimiters
     */
    fields: string | null;
    /**
     * Override the default delimiter for every filter delimiters
     */
    filters: string | null;
    /**
     * Override the default delimiter for every sort delimiters
     */
    sorts: string | null;
    /**
     * Override the default delimiter for every include delimiters
     */
    includes: string | null;
    /**
     * Override the default delimiter for every param delimiters
     */
    params: string | null;
  }>;
  /**
   * Indicate if the query string will contain or not the question mark at begin on it
   */
  useQuestionMark?: boolean;
  /**
   * Additional params to be added to the query string
   */
  params?: Record<string, (string | number)[]>;
  pagination?: {
    page: number;
    limit?: number;
  };
}
