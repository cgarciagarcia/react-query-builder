import { useState } from "react";
import {
  clearFieldsAction,
  clearFiltersAction,
  clearIncludeAction,
  clearSortsAction,
  fieldAction,
  filterAction,
  includeAction,
  removeFieldAction,
  removeFilterAction,
  removeIncludeAction,
  removeSortAction,
  sortAction,
} from "@/actions";
import { build } from "@/utils";
import {
  type Alias,
  type Filters,
  type GlobalState,
  type Includes,
  type QueryBuilder,
  type Sorts,
} from "./types";

interface BaseConfig<AliasType> {
  aliases?: AliasType;
  includes?: Includes;
  sorts?: Sorts;
  filters?: Filters;
  delimiters?: {
    global: string;
    fields: string | null;
    filters: string | null;
    sorts: string | null;
    includes: string | null;
    appends: string | null;
  };
}

export const useQueryBuilder = <
  Aliases extends Record<string, string> = NonNullable<unknown>,
>(
  config: BaseConfig<Aliases> = {},
): QueryBuilder<Aliases> => {
  const [state, setState] = useState<GlobalState<Aliases>>(() => ({
    aliases: {} as Alias<Aliases>,
    filters: [],
    includes: [],
    sorts: [],
    fields: [],
    ...config,
    delimiters: {
      global: ",",
      fields: null,
      filters: null,
      sorts: null,
      includes: null,
      appends: null,
      ...config.delimiters,
    },
  }));

  const builder: QueryBuilder<Aliases> = {
    filter: (attribute, value) => {
      setState((s) => filterAction(attribute, value, s));
      return builder;
    },
    removeFilter: (...attribute) => {
      setState((s) => removeFilterAction(attribute, s));
      return builder;
    },
    clearFilters: () => {
      setState((s) => clearFiltersAction(s));
      return builder;
    },
    include: (...includes) => {
      setState((s) => includeAction(includes, s));
      return builder;
    },
    clearIncludes: () => {
      setState((s) => clearIncludeAction(s));
      return builder;
    },
    removeInclude: (...includes) => {
      setState((s) => removeIncludeAction(includes, s));
      return builder;
    },
    sort: (attribute, direction) => {
      setState((s) =>
        sortAction({ attribute, direction: direction ?? "asc" }, s),
      );
      return builder;
    },
    removeSort: (...attribute) => {
      setState((s) => removeSortAction(attribute, s));
      return builder;
    },
    clearSorts: () => {
      setState((s) => clearSortsAction(s));
      return builder;
    },
    fields: (...attribute) => {
      setState((s) => fieldAction(attribute, s));
      return builder;
    },
    removeField: (...attribute) => {
      setState((s) => removeFieldAction(attribute, s));
      return builder;
    },
    clearFields: () => {
      setState((s) => clearFieldsAction(s));
      return builder;
    },
    build: () => build(state),
  };

  return builder;
};
