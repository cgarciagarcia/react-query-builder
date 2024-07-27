import { usingAlias } from '@/utils'
import { type Sort, type GlobalState } from '@/types'

export const sortAction = <T> (sort: Sort, state: GlobalState<T>) => {
  const attributeAliased = usingAlias(state, sort.attribute)
  return {
    ...state,
    sorts: [...state.sorts, { ...sort, attribute: attributeAliased }]
  } satisfies GlobalState<T>
}

export const removeSortAction = <T> (attributes: string[], state: GlobalState<T>) => {
  const attributesAliased = attributes.map(attr => usingAlias(state, attr))
  return {
    ...state,
    sorts: state.sorts.filter((sort) => !attributesAliased.includes(sort.attribute))
  } satisfies GlobalState<T>
}

export const clearSortsAction = <T> (state: GlobalState<T>) => ({
  ...state,
  sorts: []
})
