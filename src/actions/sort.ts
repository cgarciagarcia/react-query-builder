import { usingAlias }                  from "../utils";
import { type Sort, type GlobalState } from "types";

export const sortAction = <T>(sorts: Sort, state: GlobalState<T>) => {
  const [attribute, direction] = sorts;
  const attributeAliased = usingAlias(state, attribute);
  return {
    ...state,
    sorts: [...state.sorts, [attributeAliased, direction]],
  } satisfies GlobalState<T>;
};
