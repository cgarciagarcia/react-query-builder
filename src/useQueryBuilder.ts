import { useState } from "react";
import {
  buildAction,
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
  toArray,
} from "@/actions";
import { reverseConflicts } from "@/actions/conflict";
import { limitAction, pageAction } from "@/actions/pagination";
import {
  clearParamsAction,
  paramAction,
  removeParamAction,
} from "@/actions/param";
import { whenAction } from "@/actions/when";
import { hasField, hasFilter, hasInclude, hasParam, hasSort } from "@/utils";
import _ from "lodash/fp";
import {
  type ConflictMap,
  type Filters,
  type GlobalState,
  type Includes,
  type QueryBuilder,
  type Sorts,
} from "./types";

export interface BaseConfig<AliasType> {
  aliases?: AliasType;
  includes?: Includes;
  sorts?: Sorts<AliasType>;
  filters?: Filters;
  pruneConflictingFilters?: ConflictMap;
  delimiters?: {
    global: string;
    fields: string | null;
    filters: string | null;
    sorts: string | null;
    includes: string | null;
    params: string | null;
  };
  useQuestionMark?: boolean;
  params?: Record<string, (string | number)[]>;
  pagination?: {
    page: number;
    limit?: number;
  };
}

export const useQueryBuilder = <Aliases>(
  config: BaseConfig<Aliases> = {},
): QueryBuilder<Aliases> => {
  const [state, setState] = useState<GlobalState<Aliases>>(() => ({
    aliases: {} as Aliases,
    filters: [],
    includes: [],
    sorts: [],
    fields: [],
    params: {},
    useQuestionMark: true,
    pagination: {},
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
      params: null,
      ...config.delimiters,
    },
  }));

  const builder: QueryBuilder<Aliases> = {
    filter: (attribute, value, override = false) => {
      const filter = state.filters.find((f) => f.attribute === attribute);

      if (
        !_.isEqual(filter?.value, typeof value === "object" ? value : [value])
      ) {
        setState((s) => filterAction(attribute, value, s, override));
      }

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
      const currentSort = state.sorts.find((f) => f.attribute === attribute);
      if (currentSort?.direction !== direction) {
        setState((s) =>
          sortAction({ attribute, direction: direction ?? "asc" }, s),
        );
      }
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
    build: () => buildAction(state),
    tap: (callback) => {
      callback(state);
      return builder;
    },
    setParam: (key, value) => {
      setState((s) => paramAction(key, value, s));
      return builder;
    },
    removeParam: (...keys) => {
      setState((s) => removeParamAction(keys, s));
      return builder;
    },
    clearParams: () => {
      setState((s) => clearParamsAction(s));
      return builder;
    },
    when: (condition, callback) => {
      whenAction(condition, callback, state);
      return builder;
    },
    toArray: () => toArray(state),
    hasFilter: (...filters) => hasFilter(filters, state),
    hasSort: (...sorts) => hasSort(sorts, state),
    hasInclude: (...includes) => hasInclude(includes, state),
    hasField: (...fields) => hasField(fields, state),
    hasParam: (...key) => hasParam(key, state),
    getCurrentPage: () => {
      return state.pagination?.page ?? undefined;
    },
    page: (page) => {
      setState((s) => pageAction(page, s));
      return builder;
    },
    limit: (limit) => {
      setState((s) => limitAction(limit, s));
      return builder;
    },
    nextPage: () => {
      setState((s) =>
        s.pagination?.page ? pageAction(s.pagination.page + 1, s) : s,
      );
      return builder;
    },
    previousPage: () => {
      setState((s) =>
        s.pagination?.page ? pageAction(s.pagination.page - 1, s) : s,
      );
      return builder;
    },
  };

  return builder;
};
