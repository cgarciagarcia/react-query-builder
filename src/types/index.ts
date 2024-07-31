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
  filter: (attribute: (AliasType extends object ? (keyof AliasType)|string : string), value: FilterValue) => QueryBuilder<AliasType>;
  removeFilter: (...attribute: (AliasType extends object ? keyof AliasType : string)[]) => QueryBuilder<AliasType>;
  clearFilters: () => QueryBuilder<AliasType>;
  include: (...includes: Includes) => QueryBuilder<AliasType>;
  removeInclude: (...include: Includes) => QueryBuilder<AliasType>;
  clearIncludes: () => QueryBuilder<AliasType>;
  sort: (attribute: (AliasType extends object ? keyof AliasType : string), direction?: 'asc' | 'desc') => QueryBuilder<AliasType>;
  removeSort: (...attribute: (AliasType extends object ? keyof AliasType : string)[]) => QueryBuilder<AliasType>;
  clearSorts: () => QueryBuilder<AliasType>;
  build: () => string;
  fields: (...attribute: Field[]) => QueryBuilder<AliasType>;
  removeField: (...attribute: Field[]) => QueryBuilder<AliasType>;
  clearFields: () => QueryBuilder<AliasType>;
}
