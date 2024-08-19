import {
  type Alias,
  type Filter,
  type FilterValue,
  type GlobalState,
} from "@/types";
import { usingAlias } from "@/utils";

export const filterAction = <Al extends Alias<object>, Attr extends string>(
  attribute: Attr,
  value: FilterValue,
  state: GlobalState<Al>,
  override: boolean = false,
) => {
  let prevFilter: Filter | undefined;

  const conflicts: string[] | undefined =
    state.pruneConflictingFilters[attribute];
  const allFilters = state.filters.reduce((filters, filter) => {
    if (filter.attribute === attribute) {
      prevFilter = filter;
      return filters;
    }
    if (conflicts && conflicts.includes(filter.attribute)) {
      return filters;
    }

    return [...filters, filter];
  }, [] as Filter[]);

  const val = Array.isArray(value) ? value : [value];

  const newState: GlobalState<Al> = {
    ...state,
    filters: [
      ...allFilters,
      {
        attribute: attribute,
        value: override ? val : [...(prevFilter?.value ?? []), ...val],
      },
    ],
  };
  return newState;
};

export const clearFiltersAction = <Al>(state: GlobalState<Al>) => {
  return {
    ...state,
    filters: [],
  };
};

export const removeFilterAction = <
  Al extends Alias<object>,
  Attr extends string[],
>(
  attribute: Attr,
  state: GlobalState<Al>,
) => {
  const filterAliased = attribute.map((attr) => usingAlias(state, attr));
  const newState: GlobalState<Al> = {
    ...state,
    filters: state.filters.filter(
      (filter) => !filterAliased.includes(filter.attribute),
    ),
  };
  return newState;
};
