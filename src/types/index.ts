export type AliasAttribute<Al> = Al extends object
  ? (keyof Al & string) | string
  : string;

export interface Sort<T> {
  attribute: AliasAttribute<T>;
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
  attribute: AliasAttribute<Al>;
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
    attribute: AliasAttribute<AliasType>,
    value: TFilter,
    ...override: TFilter extends OperatorType
      ? [override: FilterValue]
      : [override?: boolean]
  ) => QueryBuilder<AliasType>;
  removeFilter: (
    ...filtersToRemove: AliasAttribute<AliasType>[]
  ) => QueryBuilder<AliasType>;
  clearFilters: () => QueryBuilder<AliasType>;
  include: (...includes: Include[]) => QueryBuilder<AliasType>;
  removeInclude: (...includesToRemove: Include[]) => QueryBuilder<AliasType>;
  clearIncludes: () => QueryBuilder<AliasType>;
  sort: (
    attribute: AliasAttribute<AliasType>,
    direction?: "asc" | "desc",
  ) => QueryBuilder<AliasType>;
  removeSort: (
    ...attributeToRemove: AliasAttribute<AliasType>[]
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
  hasFilter: (...attribute: AliasAttribute<AliasType>[]) => boolean;
  hasSort: (...attribute: AliasAttribute<AliasType>[]) => boolean;
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

export interface BaseConfig<
  AliasType extends Record<string, string> | undefined = undefined,
> {
  aliases?: AliasType;
  includes?: Include[];
  sorts?: Sort<AliasType>[];
  filters?: Filter<AliasType>[];
  fields?: Field[];
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
