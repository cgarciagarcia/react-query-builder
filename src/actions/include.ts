import { type GlobalState, type Include } from "@/types";

export const includeAction = <T>(
  includes: Include[],
  state: GlobalState<T>,
): GlobalState<T> => {
  const uniqueIncludes = Array.from(new Set(includes));

  return {
    ...state,
    includes: [
      ...state.includes.filter((include) => !uniqueIncludes.includes(include)),
      ...uniqueIncludes,
    ],
  };
};

export const removeIncludeAction = <T>(
  includes: Include[],
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
