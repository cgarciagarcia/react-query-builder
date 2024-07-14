import { type GlobalState, usingAlias } from "@/index";

export type Sort = [string, "asc" | "desc"];

export type Sorts = Sort[];

export const sortAction = <T>(sorts: Sort, state: GlobalState<T>) => {
  const [attribute, direction] = sorts;
  const attributeAliased = usingAlias(state, attribute);
  return {
    ...state,
    sorts: [...state.sorts, [attributeAliased, direction]],
  } satisfies GlobalState<T>;
};
