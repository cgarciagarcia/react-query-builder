import {
  type Filter,
  type FilterValue,
  type GlobalState,
  type OperatorType,
  type QueryBuilder,
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
  builder: QueryBuilder<Al>,
): GlobalState<Al> => {
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

  const newFilter: Filter = {
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

  console.log(123, state.watchers.filter[attribute]);

  if (attribute in state.watchers.filter && state.watchers.filter[attribute]) {
    state.watchers.filter[attribute](newFilter, builder);
  }

  return {
    ...state,
    filters: [...allFilters, newFilter],
  };
};

export const clearFiltersAction = <Al>(
  state: GlobalState<Al>,
  builder: QueryBuilder<Al>,
): GlobalState<Al> => {
  for (const attribute in state.watchers.filter) {
    state.watchers.filter[attribute](undefined, builder);
  }

  return {
    ...state,
    filters: [],
  };
};

export const removeFilterAction = <Al>(
  attributes: string[],
  state: GlobalState<Al>,
  builder: QueryBuilder<Al>,
): GlobalState<Al> => {
  attributes.map((attribute) =>
    attribute in state.watchers.filter && state.watchers.filter[attribute]
      ? state.watchers.filter[attribute](undefined, builder)
      : undefined,
  );
  return {
    ...state,
    filters: state.filters.filter(
      (filter) => !attributes.includes(filter.attribute),
    ),
  };
};
