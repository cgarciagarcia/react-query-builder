import { type GlobalState, type Sort } from "@/types";

export const sortAction = <T>(
  sort: Sort<T>,
  state: GlobalState<T>,
): GlobalState<T> => ({
  ...state,
  sorts: [...state.sorts.filter((s) => s.attribute !== sort.attribute), sort],
});

export const removeSortAction = <T>(
  attributes: (T extends object ? (keyof T & string) | string : string)[],
  state: GlobalState<T>,
): GlobalState<T> => ({
  ...state,
  sorts: state.sorts.filter((sort) => !attributes.includes(sort.attribute)),
});

export const clearSortsAction = <T>(state: GlobalState<T>): GlobalState<T> => ({
  ...state,
  sorts: [],
});
