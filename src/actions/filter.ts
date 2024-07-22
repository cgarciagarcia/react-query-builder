import { usingAlias } from '../utils'
import { type Alias, type Filter, type FilterValue, type GlobalState } from 'types'

export const filterAction = <Al extends Alias<object>, Attr extends string> (
  attribute: Attr,
  value: FilterValue,
  state: GlobalState<Al>
) => {
  const alias = usingAlias(state, attribute)
  let prevFilter: Filter | undefined

  const allFilters = state.filters.reduce((filters, filter) => {
    if (filter.attribute === alias) {
      prevFilter = filter
      return filters
    }
    return [...filters, filter]
  }, [] as Filter[])

  const val = Array.isArray(value) ? value : [value]

  const newState: GlobalState<Al> = {
    ...state,
    filters: [
      ...allFilters,
      {
        attribute: attribute,
        value: [...(prevFilter?.value ?? []), ...val]
      }
    ]
  }
  return newState
}

export const clearFiltersAction = <Al> (state: GlobalState<Al>) => {
  return {
    ...state,
    filters: []
  }
}

export const removeFilterAction = <Al extends Alias<object>, Attr extends string> (
  attribute: Attr,
  state: GlobalState<Al>
) => {
  const alias = usingAlias(state, attribute)
  const newState: GlobalState<Al> = {
    ...state,
    filters: state.filters.filter((filter) => filter.attribute !== alias)
  }
  return newState
}
