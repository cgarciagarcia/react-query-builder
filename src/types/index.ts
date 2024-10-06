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
  watchers: {
    filter: Record<
      AttributeAlias<Al>,
      (filter: Filter, builder: QueryBuilder<Al>) => void
    >;
    sort: Record<
      AttributeAlias<Al>,
      (filter: Sort<Al>, builder: QueryBuilder<Al>) => void
    >;
    include: Record<
      string,
      (include: Include, builder: QueryBuilder<Al>) => void
    >;
    param: Record<string, (param: string, builder: QueryBuilder<Al>) => void>;
    field: Record<string, (field: string, builder: QueryBuilder<Al>) => void>;
  };
}

export type AttributeAlias<AliasType> = AliasType extends object
  ? (keyof AliasType & string) | string
  : string;

export interface QueryBuilder<AliasType = unknown> {
  filter: (
    attribute: AttributeAlias<AliasType>,
    value: FilterValue,
    override?: boolean | FilterValue,
  ) => QueryBuilder<AliasType>;
  removeFilter: (
    ...attribute: AttributeAlias<AliasType>[]
  ) => QueryBuilder<AliasType>;
  clearFilters: () => QueryBuilder<AliasType>;
  include: (...includes: Includes) => QueryBuilder<AliasType>;
  removeInclude: (...include: Includes) => QueryBuilder<AliasType>;
  clearIncludes: () => QueryBuilder<AliasType>;
  sort: (
    attribute: AttributeAlias<AliasType>,
    direction?: "asc" | "desc",
  ) => QueryBuilder<AliasType>;
  removeSort: (
    ...attribute: AttributeAlias<AliasType>[]
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
  hasFilter: (...attribute: AttributeAlias<AliasType>[]) => boolean;
  hasSort: (...attribute: AttributeAlias<AliasType>[]) => boolean;
  hasInclude: (...include: Includes) => boolean;
  hasField: (...attribute: Fields) => boolean;
  hasParam: (...key: string[]) => boolean;
}
