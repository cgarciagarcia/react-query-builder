import { type GlobalState, type Includes } from '../types'

export const includeAction = <T> (
  includes: Includes,
  state: GlobalState<T>
): GlobalState<T> => {
  return {
    ...state,
    includes: [...state.includes, ...includes]
  } satisfies GlobalState<T>
}

export const removeIncludeAction = <T> (
  includes: Includes,
  state: GlobalState<T>
): GlobalState<T> => {
  return {
    ...state,
    includes: state.includes.filter((i) => !includes.includes(i))
  } satisfies GlobalState<T>
}

export const clearIncludeAction = <T> (state: GlobalState<T>): GlobalState<T> => {
  return {
    ...state,
    includes: []
  } satisfies GlobalState<T>
}
