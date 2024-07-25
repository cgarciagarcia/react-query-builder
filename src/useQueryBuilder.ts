import { useReducer, useState } from 'react'

import {
  build,
  clearFiltersAction,
  clearIncludeAction,
  clearSortsAction,
  filterAction,
  includeAction,
  removeFilterAction,
  removeIncludeAction,
  removeSortAction,
  sortAction
} from './index'

import {
  type Actions,
  type Alias,
  type Filter,
  type Filters,
  type GlobalState,
  type Includes,
  type QueryBuilder,
  type Sort,
  type Sorts
} from './types'

interface Action {
  type: Actions;
  payload?: unknown;
}

const reducer = <Aliases extends Record<string, string>> (
  state: GlobalState<Aliases>,
  action: Action
): GlobalState<Aliases> => {
  switch (action?.type) {
    case 'filter': {
      const filter = action.payload as Filter
      return filterAction(filter.attribute, filter.value, state)
    }
    case 'remove_filter': {
      const attribute = action.payload as string[]
      return removeFilterAction(attribute, state)
    }
    case 'clear_filters': {
      return clearFiltersAction(state)
    }
    case 'include': {
      const includes = action.payload as Includes
      return includeAction(includes, state)
    }
    case 'remove_include': {
      const include = action.payload as Includes
      return removeIncludeAction(include, state)
    }
    case 'clear_includes': {
      return clearIncludeAction(state)
    }
    case 'sort': {
      const sorts = action.payload as Sort
      return sortAction(sorts, state)
    }
    case 'remove_sort': {
      const attribute = action.payload as string[]
      return removeSortAction(attribute, state)
    }
    case 'clear_sorts': {
      return clearSortsAction(state)
    }
    default: {
      return { ...state }
    }
  }
}

const initialState = <T> (): GlobalState<T> => ({
  aliases: {} as Alias<T>,
  filters: [],
  includes: [],
  sorts: []
})


interface BaseConfig<AliasType> {
  aliases?: AliasType;
  includes?: Includes
  sorts?: Sorts
  filters?: Filters
}

export const useQueryBuilder: <Aliases extends Record<string, string>>(
  config?: BaseConfig<Aliases>
) => QueryBuilder<Aliases> = <Aliases extends Record<string, string>> (
  config = {} as BaseConfig<Aliases>
) => {
  const [init] = useState(() => initialState<Aliases>())
  const [state, dispatch] = useReducer(reducer, init, (init) => ({
    ...init,
    aliases: config?.aliases ?? ({} as Aliases)
  }))

  const builder: QueryBuilder<Aliases> = {
    filter: (attribute, value) => {
      dispatch({
        type: 'filter',
        payload: { attribute, value }
      })
      return builder
    },
    removeFilter: (...attribute) => {
      dispatch({
        type: 'remove_filter',
        payload: attribute
      })
      return builder
    },
    clearFilters: () => {
      dispatch({
        type: 'clear_filters'
      })
      return builder
    },
    include: (includes) => {
      dispatch({
        type: 'include',
        payload: includes
      })
      return builder
    },
    clearIncludes: () => {
      dispatch({
        type: 'clear_includes'
      })
      return builder
    },
    removeInclude: (...includes) => {
      dispatch({
        type: 'remove_include',
        payload: includes
      })
      return builder
    },
    sort: (attribute, direction) => {
      dispatch({
        type: 'sort',
        payload: { attribute, direction: direction ?? 'asc' }
      })
      return builder
    },
    removeSort: (attribute) => {
      dispatch({
        type: 'remove_sort',
        payload: attribute
      })
      return builder
    },
    clearSorts: () => {
      dispatch({
        type: 'clear_sorts'
      })
      return builder
    },
    build: () => build(state)
  }

  return builder
}
