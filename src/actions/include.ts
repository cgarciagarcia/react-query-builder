import { type GlobalState } from "@/index";

export type Include = string
export type Includes = string[];

export const includeAction = <T>(
  includes: Include,
  state: GlobalState<T>,
): GlobalState<T> => {
  return {
    ...state,
    includes: [...state.includes, includes],
  } satisfies GlobalState<T>;
};
