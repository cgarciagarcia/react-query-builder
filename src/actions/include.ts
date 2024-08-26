import { type GlobalState, type Includes } from "@/types";

export const includeAction = <T>(
  includes: Includes,
  state: GlobalState<T>,
): GlobalState<T> => ({
  ...state,
  includes: [
    ...state.includes.filter((include) => !includes.includes(include)),
    ...includes,
  ],
});

export const removeIncludeAction = <T>(
  includes: Includes,
  state: GlobalState<T>,
): GlobalState<T> => ({
  ...state,
  includes: state.includes.filter((i) => !includes.includes(i)),
});

export const clearIncludeAction = <T>(
  state: GlobalState<T>,
): GlobalState<T> => ({
  ...state,
  includes: [],
});
