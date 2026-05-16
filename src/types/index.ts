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

export interface SearchParamsAdapterOptions {
  /**
   * Remap the URL keys the parser looks for. Any omitted key falls back to
   * its default (`filter`, `sort`, `include`, `fields`).
   */
  keys?: Partial<Record<ConfigurableURLKey, string>>;
  /**
   * Frontend → backend attribute mapping. When set, the reader applies the
   * REVERSE map (URL contains backend names → state holds frontend names),
   * and the writer applies the forward map (state holds frontend names → URL
   * contains backend names). Round-trip-safe with `.build()` since the
   * builder's `.build()` already produces backend names.
   *
   * If you do not pass this here, `createSearchParamsAdapter` picks it up
   * from the builder's `BaseConfig.aliases` at `read()` time.
   */
  aliases?: Record<string, string>;
  /**
   * Explicit allowlist of query params that are NOT `filter`/`sort`/`include`/
   * `fields` and should be preserved as `params` in the builder state. Any
   * other unknown param is ignored.
   */
  allowedParams?: string[];
  /**
   * Defense-in-depth denylist applied to filter / sort / include / field
   * attribute names AND to params (overrides `allowedParams`). If a URL entry
   * matches any name here it is silently dropped on read. Use it to block
   * sensitive backend attributes from being injected via crafted URLs (for
   * example `is_admin`, `password`, `tenant_id`, `internal_audit_log`).
   *
   * Matching is on the raw URL name (the backend name) before any reverse
   * alias is applied, since the threat is what reaches the wire.
   */
  excludeKeys?: string[];
  /**
   * Lazy provider of the query string to parse. Default:
   * `() => window.location.search`. Evaluated when `read()` is called, not
   * at adapter-creation time, so it is safe to instantiate at module scope.
   */
  source?: () => string;
  /**
   * Enable two-way binding. When set, the adapter exposes a `write(state)`
   * function that the builder invokes on every mutation, serialising the
   * state back to the URL using the same `keys` and `allowedParams`.
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
   * `allowedParams`), so other consumers of the URL (analytics, locale
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
   * Optional. When defined, the builder invokes this on every state change
   * (it is wired as an internal subscriber). Use it to keep an external
   * source in sync — for example, `history.replaceState` for two-way URL
   * binding, or a `localStorage` write.
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
