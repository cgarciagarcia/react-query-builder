import { type Fields, type GlobalState, type Includes } from "@/types";

export const hasFilter = <T>(
  attributes: string[],
  state: GlobalState<T>,
): boolean =>
  state.filters.some((filter) => attributes.includes(filter.attribute));

export const hasSort = <T>(sorts: string[], state: GlobalState<T>): boolean =>
  state.sorts.some((sort) => sorts.includes(sort.attribute));

export const hasInclude = <T>(
  includes: Includes,
  state: GlobalState<T>,
): boolean => state.includes.some((include) => includes.includes(include));

export const hasField = <T>(fields: Fields, state: GlobalState<T>): boolean =>
  state.fields.some((field) => fields.includes(field));

export const hasParam = <T>(params: string[], state: GlobalState<T>): boolean =>
  Object.keys(state.params).some((param) => params.includes(param));
