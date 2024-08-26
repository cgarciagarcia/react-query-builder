import { type Filter, type FilterValue, type GlobalState } from "@/types";
import { usingAlias } from "@/utils";

export const filterAction = <Al>(
  attribute: Al extends object ? (keyof Al & string) | string : string,
  value: FilterValue,
  state: GlobalState<Al>,
  override: boolean = false,
): GlobalState<Al> => {
  const conflicts = state.pruneConflictingFilters[attribute];
  const allFilters = state.filters.reduce<Filter[]>((filters, filter) => {
    if (filter.attribute === attribute) {
      return filters;
    }
    if (conflicts?.includes(filter.attribute)) {
      return filters;
    }
    return [...filters, filter];
  }, []);

  const val = Array.isArray(value) ? value : [value];
  const newFilter: Filter = {
    attribute,
    value: override ? val : [...(state.filters.find(f => f.attribute === attribute)?.value ?? []), ...val],
  };

  return {
    ...state,
    filters: [...allFilters, newFilter],
  };
};

export const clearFiltersAction = <Al>(state: GlobalState<Al>): GlobalState<Al> => ({
  ...state,
  filters: [],
});

export const removeFilterAction = <Al, Attr extends string[]>(
  attribute: Attr,
  state: GlobalState<Al>,
): GlobalState<Al> => {
  const filterAliased = attribute.map(attr => usingAlias(state, attr));
  return {
    ...state,
    filters: state.filters.filter(filter => !filterAliased.includes(filter.attribute)),
  };
};
