export interface Sort<T> {
  attribute: T extends object ? (keyof T & string) | string : string;
  direction: "asc" | "desc";
}

export type Include = string;

export type FilterValue = (string | number)[] | string | number;

export const FilterOperator = {
  Equals: "=",
  LessThan: "<",
  GreaterThan: ">",
  LessThanOrEqual: "<=",
  GreaterThanOrEqual: ">=",
  Distinct: "<>",
} as const;

export type OperatorType = (typeof FilterOperator)[keyof typeof FilterOperator];

export interface Filter<Al> {
  attribute: Al extends object ? (keyof Al & string) | string : string;
  value: (string | number)[];
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
  filter: (
    attribute: AliasType extends object
      ? (keyof AliasType & string) | string
      : string,
    value: FilterValue,
    override?: boolean | FilterValue,
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
