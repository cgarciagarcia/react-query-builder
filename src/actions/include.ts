import { type GlobalState } from "@/index";

export type Includes = string[];

export const includeAction = <T>(
  includes: Includes,
  state: GlobalState<T>,
): GlobalState<T> => {
  return {
    ...state,
    includes: includes,
  };
};
