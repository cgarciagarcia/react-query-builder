import  { type AttributeAlias, type Field, type FilterValue, type GlobalState, type Include, type QueryBuilder , type GlobalState } from "@/types"


export class MockQueryBuilder implements QueryBuilder {
  build (): string {
    return ""
  }

  clearFields (): QueryBuilder<unknown> {
    return this
  }

  clearFilters (): QueryBuilder<unknown> {
    return this
  }

  clearIncludes (): QueryBuilder<unknown> {
    return this
  }

  clearParams (): QueryBuilder<unknown> {
    return this
  }

  clearSorts (): QueryBuilder<unknown> {
    return this
  }

  fields (attribute: Field): QueryBuilder<unknown> {
    return this
  }

  filter (attribute: AttributeAlias<unknown>, value: FilterValue, override: boolean | FilterValue | undefined): QueryBuilder<unknown> {
    return this
  }

  hasField (attribute: Field): boolean {
    return false
  }

  hasFilter (attribute: AttributeAlias<unknown>): boolean {
    return false
  }

  hasInclude (include: Include): boolean {
    return false
  }

  hasParam (key: string): boolean {
    return false
  }

  hasSort (attribute: AttributeAlias<unknown>): boolean {
    return false
  }

  include (includes: Include): QueryBuilder<unknown> {
    return this
  }

  removeField (attribute: Field): QueryBuilder<unknown> {
    return this
  }

  removeFilter (attribute: AttributeAlias<unknown>): QueryBuilder<unknown> {
    return this
  }

  removeInclude (include: Include): QueryBuilder<unknown> {
    return this
  }

  removeParam (key: string): QueryBuilder<unknown> {
    return this
  }

  removeSort (attribute: AttributeAlias<unknown>): QueryBuilder<unknown> {
    return this
  }

  setParam (key: string, value: (string | number)[] | string | number): QueryBuilder<unknown> {
    return this
  }

  sort (attribute: AttributeAlias<unknown>, direction: "asc" | "desc" | undefined): QueryBuilder<unknown> {
    return this
  }

  tap (callback: (state: GlobalState<unknown>) => void): QueryBuilder<unknown> {
    return this
  }

  toArray (): string[] {
    return []
  }

  when (condition: boolean, callback: (state: GlobalState<unknown>) => void): QueryBuilder<unknown> {
    return this
  }
}


export const initialState: GlobalState = {
  aliases: {},
  filters: [],
  includes: [],
  sorts: [],
  fields: [],
  pruneConflictingFilters: {},
  delimiters: {
    global: ",",
    fields: null,
    filters: null,
    sorts: null,
    includes: null,
    params: null,
  },
  useQuestionMark: true,
  params: {},
  watchers: {
    filter: {},
    sort: {},
    include: {},
    field: {},
    param: {},
  },
} as const;
