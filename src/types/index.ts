export type Alias<Prop> = {
  [key in keyof Prop]: string;
};

export interface Sort {
  attribute: string;
  direction: "asc" | "desc";
}

export type Sorts = Sort[];
export type Include = string;
export type Includes = string[];
export type FilterValue = (string | number)[] | string | number;

export interface Filter {
  attribute: string;
  value: (string | number)[];
}

export type Filters = Filter[];

export type Field = string;
export type Fields = Field[];

export type ConflictMap = Record<string, string[]> | Record<string, never>;

export interface GlobalState<Al = Record<string, never>> {
  aliases: Alias<Al>;
  fields: Fields;
  filters: Filter[];
  includes: Includes;
  sorts: Sorts;
  pruneConflictingFilters: ConflictMap;
  delimiters: {
    global: string;
    fields: string | null;
    filters: string | null;
    sorts: string | null;
    includes: string | null;
    appends: string | null;
  };
}

export interface QueryBuilder<AliasType> {
  filter: (
    attribute: AliasType extends object ? keyof AliasType | string : string,
    value: FilterValue,
    override?: boolean,
  ) => QueryBuilder<AliasType>;
  removeFilter: (
    ...attribute: (AliasType extends object ? keyof AliasType : string)[]
  ) => QueryBuilder<AliasType>;
  clearFilters: () => QueryBuilder<AliasType>;
  include: (...includes: Includes) => QueryBuilder<AliasType>;
  removeInclude: (...include: Includes) => QueryBuilder<AliasType>;
  clearIncludes: () => QueryBuilder<AliasType>;
  sort: (
    attribute: AliasType extends object ? keyof AliasType : string,
    direction?: "asc" | "desc",
  ) => QueryBuilder<AliasType>;
  removeSort: (
    ...attribute: (AliasType extends object ? keyof AliasType : string)[]
  ) => QueryBuilder<AliasType>;
  clearSorts: () => QueryBuilder<AliasType>;
  build: () => string;
  fields: (...attribute: Field[]) => QueryBuilder<AliasType>;
  removeField: (...attribute: Field[]) => QueryBuilder<AliasType>;
  clearFields: () => QueryBuilder<AliasType>;
}
