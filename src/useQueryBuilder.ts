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
import { reverseConflicts } from "@/actions/conflict";
import { build } from "@/utils";
import {
  type Alias,
  type ConflictMap,
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
  pruneConflictingFilters?: ConflictMap;
  delimiters?: {
    global: string;
    fields: string | null;
    filters: string | null;
    sorts: string | null;
    includes: string | null;
    appends: string | null;
  };
  useQuestionMark?: boolean;
}

export const useQueryBuilder = <Aliases extends Record<string, string>>(
  config: BaseConfig<Aliases> = {},
): QueryBuilder<Aliases> => {
  const [state, setState] = useState<GlobalState<Aliases>>(() => ({
    aliases: {} as Alias<Aliases>,
    filters: [],
    includes: [],
    sorts: [],
    fields: [],
    ...config,
    pruneConflictingFilters: reverseConflicts(
      config.pruneConflictingFilters ?? {},
    ),
    delimiters: {
      global: ",",
      fields: null,
      filters: null,
      sorts: null,
      includes: null,
      appends: null,
      ...config.delimiters,
    },
    useQuestionMark: config.useQuestionMark ?? true,
  }));

  const builder: QueryBuilder<Aliases> = {
    filter: (attribute, value, override = false) => {
      setState((s) => filterAction(attribute, value, s, override));
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
    tap: (callback) => {
      callback(state);
      return builder;
    },
  };

  return builder;
};
