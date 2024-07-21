import { type Include, type GlobalState } from "types";

export const includeAction = <T>(
  includes: Include,
  state: GlobalState<T>,
): GlobalState<T> => {
  return {
    ...state,
    includes: [...state.includes, includes],
  } satisfies GlobalState<T>;
};
