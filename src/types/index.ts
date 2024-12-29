export type Alias<Prop> = {
  [key in keyof Prop]: string;
};

export interface Sort<T> {
  attribute: T extends object ? (keyof T & string) | string : string;
  direction: "asc" | "desc";
}

export type Sorts<T> = Sort<T>[];
export type Include = string;
export type Includes = Include[];

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

export interface Filter {
  attribute: string;
  value: (string | number)[];
  operator?: OperatorType;
}

export type Filters = Filter[];

export type Field = string;
export type Fields = Field[];

export type ConflictMap = Record<string, string[]> | Record<string, never>;

export interface GlobalState<Al = Record<string, string | undefined>> {
  aliases: Al;
  fields: Fields;
  filters: Filter[];
  includes: Includes;
  sorts: Sorts<Al>;
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

export interface QueryBuilder<AliasType = unknown> {
  filter: (
    attribute: AliasType extends object
      ? (keyof AliasType & string) | string
      : string,
    value: FilterValue,
    override?: boolean | FilterValue,
  ) => QueryBuilder<AliasType>;
  removeFilter: (
    ...attribute: (AliasType extends object
      ? (keyof AliasType & string) | string
      : string)[]
  ) => QueryBuilder<AliasType>;
  clearFilters: () => QueryBuilder<AliasType>;
  include: (...includes: Includes) => QueryBuilder<AliasType>;
  removeInclude: (...include: Includes) => QueryBuilder<AliasType>;
  clearIncludes: () => QueryBuilder<AliasType>;
  sort: (
    attribute: AliasType extends object
      ? (keyof AliasType & string) | string
      : string,
    direction?: "asc" | "desc",
  ) => QueryBuilder<AliasType>;
  removeSort: (
    ...attribute: (AliasType extends object
      ? (keyof AliasType & string) | string
      : string)[]
  ) => QueryBuilder<AliasType>;
  clearSorts: () => QueryBuilder<AliasType>;
  build: () => string;
  fields: (...attribute: Field[]) => QueryBuilder<AliasType>;
  removeField: (...attribute: Field[]) => QueryBuilder<AliasType>;
  clearFields: () => QueryBuilder<AliasType>;
  tap: (
    callback: (state: GlobalState<AliasType>) => void,
  ) => QueryBuilder<AliasType>;
  setParam: (
    key: string,
    value: (string | number)[] | string | number,
  ) => QueryBuilder<AliasType>;
  removeParam: (...key: string[]) => QueryBuilder<AliasType>;
  clearParams: () => QueryBuilder<AliasType>;
  when: (
    condition: boolean,
    callback: (state: GlobalState<AliasType>) => void,
  ) => QueryBuilder<AliasType>;
  toArray: () => string[];
  hasFilter: (
    ...attribute: (AliasType extends object
      ? (keyof AliasType & string) | string
      : string)[]
  ) => boolean;
  hasSort: (
    ...attribute: (AliasType extends object
      ? (keyof AliasType & string) | string
      : string)[]
  ) => boolean;
  hasInclude: (...include: Includes) => boolean;
  hasField: (...attribute: Fields) => boolean;
  hasParam: (...key: string[]) => boolean;
  page: (page: number) => QueryBuilder<AliasType>;
  limit: (limit: number) => QueryBuilder<AliasType>;
  nextPage: () => QueryBuilder<AliasType>;
  previousPage: () => QueryBuilder<AliasType>;
  getCurrentPage: () => number | undefined;
}
