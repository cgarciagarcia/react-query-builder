import { type Include, type GlobalState } from "../types";

export const includeAction = <T>(
  includes: Include,
  state: GlobalState<T>,
): GlobalState<T> => {
  return {
    ...state,
    includes: [...state.includes, includes],
  } satisfies GlobalState<T>;
};

export const removeIncludeAction = <T>(
  include: Include,
  state: GlobalState<T>,
): GlobalState<T> => {
  return {
    ...state,
    includes: state.includes.filter((i) => i!== include),
  } satisfies GlobalState<T>;
}

export const clearIncludeAction = <T>(state: GlobalState<T>): GlobalState<T> => {
  return {
    ...state,
    includes: [],
  } satisfies GlobalState<T>;
}
