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
  type Filter,
  type GlobalState,
  type Includes,
  type QueryBuilder,
  type Sorts,
} from "./types";

export interface BaseConfig<AliasType> {
  aliases?: AliasType;
  includes?: Includes;
  sorts?: Sorts<AliasType>;
  filters?: Filter<AliasType>[];
  /**
   * Create a map of filters that don't work together
   */
  pruneConflictingFilters?: ConflictMap;
  /**
   * Delimiters used in the query string as separator among values, the default value is "," ( comma )
   */
  delimiters?: Partial<{
    /**
     * The global delimiter is used as default for every delimiter
     */
    global: string;
    /**
     * Override the default delimiter for every field delimiters
     */
    fields: string | null;
    /**
     * Override the default delimiter for every filter delimiters
     */
    filters: string | null;
    /**
     * Override the default delimiter for every sort delimiters
     */
    sorts: string | null;
    /**
     * Override the default delimiter for every include delimiters
     */
    includes: string | null;
    /**
     * Override the default delimiter for every param delimiters
     */
    params: string | null;
  }>;
  /**
   * Indicate if the query string will contain or not the question mark at begin on it
   */
  useQuestionMark?: boolean;
  /**
   * Additional params to be added to the query string
   */
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
      const uniqueValues = Array.isArray(value)
        ? Array.from(new Set(value))
        : [value];

      const areEquals = _.isEmpty(_.xor(filter?.value, uniqueValues));

      if (!areEquals) {
        setState((s) => filterAction(attribute, uniqueValues, s, override));
      }

      return builder;
    },
    removeFilter: (...filtersToRemove) => {
      if (
        state.filters.some((filter) =>
          filtersToRemove.includes(filter.attribute),
        )
      ) {
        setState((s) => removeFilterAction(filtersToRemove, s));
      }
      return builder;
    },
    clearFilters: () => {
      if (state.filters.length > 0) {
        setState((s) => clearFiltersAction(s));
      }
      return builder;
    },
    include: (...includes) => {
      const areNotEquals = _.difference(includes, state.includes).length !== 0;
      if (areNotEquals) {
        setState((s) => includeAction(includes, s));
      }
      return builder;
    },
    clearIncludes: () => {
      if (state.includes.length > 0) {
        setState((s) => clearIncludeAction(s));
      }
      return builder;
    },
    removeInclude: (...includesToRemove) => {
      const hasIncludeToRemove =
        _.intersection(includesToRemove, state.includes).length !== 0;
      if (hasIncludeToRemove) {
        setState((s) => removeIncludeAction(includesToRemove, s));
      }

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
    removeSort: (...sortToRemove) => {
      if (state.sorts.some((sort) => sortToRemove.includes(sort.attribute))) {
        setState((s) => removeSortAction(sortToRemove, s));
      }
      return builder;
    },
    clearSorts: () => {
      if (state.sorts.length > 0) {
        setState((s) => clearSortsAction(s));
      }

      return builder;
    },
    fields: (...fields) => {
      const areNotEquals = _.difference(fields, state.fields).length !== 0;
      if (areNotEquals) {
        setState((s) => fieldAction(fields, s));
      }

      return builder;
    },
    removeField: (...fields) => {
      const hasFieldToRemove =
        _.intersection(fields, state.fields).length !== 0;
      if (hasFieldToRemove) {
        setState((s) => removeFieldAction(fields, s));
      }
      return builder;
    },
    clearFields: () => {
      if (state.fields.length > 0) {
        setState((s) => clearFieldsAction(s));
      }
      return builder;
    },
    build: () => buildAction(state),
    tap: (callback) => {
      callback(state);
      return builder;
    },
    setParam: (key, value) => {
      const uniqueValues = Array.isArray(value)
        ? Array.from(new Set(value))
        : [value];
      const areNotEquals =
        _.difference(state.params[key] ?? [], uniqueValues).length !== 0;
      if (areNotEquals || !state.params[key]) {
        setState((s) => paramAction(key, uniqueValues, s));
      }
      return builder;
    },
    removeParam: (...keys) => {
      const hasParamToRemove = _.intersection(keys, Object.keys(state.params));
      if (hasParamToRemove) {
        setState((s) => removeParamAction(keys, s));
      }
      return builder;
    },
    clearParams: () => {
      if (Object.keys(state.params).length > 0) {
        setState((s) => clearParamsAction(s));
      }
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
      if (state.pagination && page !== state.pagination?.page) {
        setState((s) => pageAction(page, s));
      }
      return builder;
    },
    limit: (limit) => {
      if (state.pagination && limit != state.pagination?.limit) {
        setState((s) => limitAction(limit, s));
      }

      return builder;
    },
    nextPage: () => {
      if (state.pagination?.page && state.pagination.page > 1) {
        setState((s) => {
          return pageAction(s.pagination?.page ? s.pagination.page + 1 : 1, s);
        });
      }
      return builder;
    },
    previousPage: () => {
      if (state.pagination?.page && state.pagination.page > 1) {
        setState((s) => {
          return pageAction(s.pagination?.page ? s.pagination.page - 1 : 1, s);
        });
      }
      return builder;
    },
  };

  return builder;
};
