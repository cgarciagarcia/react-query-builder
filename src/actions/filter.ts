import {
  type Filter,
  type FilterValue,
  type GlobalState,
  type OperatorType,
} from "@/types";

const isOperator = (value: FilterValue): value is OperatorType => {
  return (
    typeof value === "string" &&
    value.length <= 2 &&
    ["=", "<", ">", "<=", ">=", "<>"].includes(value)
  );
};

const isFilterValue = (value: FilterValue | boolean): value is FilterValue => {
  return typeof value !== "boolean";
};

export const filterAction = <Al>(
  attribute: Al extends object ? (keyof Al & string) | string : string,
  value: FilterValue,
  state: GlobalState<Al>,
  override: boolean | FilterValue = false,
): GlobalState<Al> => {
  value = Array.isArray(value)
    ? value.filter((val) => `${val}`.length !== 0)
    : value;

  const isEmpty = Array.isArray(value)
    ? value.length === 0
    : `${value}`.length === 0;

  if (isEmpty) {
    return removeFilterAction([attribute], state);
  }

  const conflicts = state.pruneConflictingFilters[attribute];
  const allFilters = state.filters.filter(
    (filter) =>
      filter.attribute !== attribute && !conflicts?.includes(filter.attribute),
  );

  const val: FilterValue = isFilterValue(override)
    ? Array.isArray(override)
      ? override
      : [override]
    : Array.isArray(value)
      ? value
      : [value];

  const shouldOverride =
    (typeof override === "boolean" && override) || isFilterValue(override);

  const newFilter: Filter<Al> = {
    attribute,
    value: shouldOverride
      ? val
      : [
          ...(state.filters.find((f) => f.attribute === attribute)?.value ??
            []),
          ...val,
        ],
    operator: isOperator(value) && isFilterValue(override) ? value : undefined,
  };

  return {
    ...state,
    filters: [...allFilters, newFilter],
  };
};

export const clearFiltersAction = <Al>(
  state: GlobalState<Al>,
): GlobalState<Al> => ({
  ...state,
  filters: [],
});

export const removeFilterAction = <Al>(
  attributes: string[],
  state: GlobalState<Al>,
): GlobalState<Al> => {
  return {
    ...state,
    filters: state.filters.filter(
      (filter) => !attributes.includes(filter.attribute),
    ),
  };
};
