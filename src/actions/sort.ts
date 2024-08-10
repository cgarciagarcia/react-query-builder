import { type Alias, type GlobalState, type Sort } from "@/types";

export const sortAction = <T extends Alias<object>>(
  sort: Sort,
  state: GlobalState<T>,
) => {
  return {
    ...state,
    sorts: [...state.sorts.filter((s) => s.attribute !== sort.attribute), sort],
  } satisfies GlobalState<T>;
};

export const removeSortAction = <T>(
  attributes: string[],
  state: GlobalState<T>,
) => {
  return {
    ...state,
    sorts: state.sorts.filter((sort) => !attributes.includes(sort.attribute)),
  } satisfies GlobalState<T>;
};

export const clearSortsAction = <T>(state: GlobalState<T>) => ({
  ...state,
  sorts: [],
});
