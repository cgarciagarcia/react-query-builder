export type Alias<Prop> = {
  [key in keyof Prop]: Prop[key] extends string ? string : string;
};

export interface Sort {
  attribute: string;
  direction: 'asc' | 'desc';
}

export type Sorts = Sort[];
export type Include = string
export type Includes = string[];
export type FilterValue = (string | number)[] | string | number;

export interface Filter {
  attribute: string;
  value: (string | number)[];
}

export type Filters = Filter[]

export type Field = string;
export type Fields = Field[]

export interface GlobalState<Al = NonNullable<unknown>> {
  aliases: Alias<Al>;
  fields: Fields;
  filters: Filter[];
  includes: Includes;
  sorts: Sorts;
}

export interface QueryBuilder<AliasType = NonNullable<unknown>> {
  filter: (attribute: keyof AliasType | string, value: FilterValue) => QueryBuilder<AliasType>;
  removeFilter: (...attribute: (keyof AliasType | string)[]) => QueryBuilder<AliasType>;
  clearFilters: () => QueryBuilder<AliasType>;
  include: (...includes: Includes) => QueryBuilder<AliasType>;
  removeInclude: (...include: Includes) => QueryBuilder<AliasType>;
  clearIncludes: () => QueryBuilder<AliasType>;
  sort: (attribute: keyof AliasType | string, direction?: 'asc' | 'desc') => QueryBuilder<AliasType>;
  removeSort: (...attribute: (keyof AliasType | string)[]) => QueryBuilder<AliasType>;
  clearSorts: () => QueryBuilder<AliasType>;
  build: () => string;
  fields: (...attribute: (keyof AliasType | string)[]) => QueryBuilder<AliasType>;
  removeField: (...attribute: (keyof AliasType | string)[]) => QueryBuilder<AliasType>;
  clearFields: () => QueryBuilder<AliasType>;
}
