import { buildAction } from "@/actions/build";
import { reverseConflicts } from "@/actions/conflict";
import {
  clearFieldsAction,
  fieldAction,
  removeFieldAction,
} from "@/actions/field";
import {
  clearFiltersAction,
  filterAction,
  isOperator,
  removeFilterAction,
} from "@/actions/filter";
import {
  clearIncludeAction,
  includeAction,
  removeIncludeAction,
} from "@/actions/include";
import { limitAction, pageAction } from "@/actions/pagination";
import {
  clearParamsAction,
  paramAction,
  removeParamAction,
} from "@/actions/param";
import { toArray } from "@/actions/presenter";
import { clearSortsAction, removeSortAction, sortAction } from "@/actions/sort";
import { whenAction } from "@/actions/when";
import {
  type BaseConfig,
  type Field,
  type FilterValue,
  type GlobalState,
  type Include,
  type OperatorType,
  type QueryBuilder,
} from "@/types";
import {
  hasField,
  hasFilter,
  hasInclude,
  hasParam,
  hasSort,
} from "@/utils/state";
import _ from "lodash/fp";

function uniqueID() {
  return Math.floor(Math.random() * Date.now());
}

export class Builder<
  Aliases extends NonNullable<Record<string, string>> | undefined = undefined,
> implements QueryBuilder<Aliases> {
  private state: GlobalState<Aliases>;

  private subscribers: Record<string, (state: GlobalState<Aliases>) => void> =
    {};

  private triggerSubscribers() {
    Object.values(this.subscribers).forEach((fn) => fn(this.state));
  }

  public addSubscriber(fn: (state: GlobalState<Aliases>) => void) {
    const id = uniqueID();
    this.subscribers[id] = fn;
    return id;
  }

  public removeSubscriber = (id: number): void => {
    delete this.subscribers[id];
  };

  constructor(config?: BaseConfig<Aliases>) {
    this.state = {
      aliases: {} as Aliases,
      filters: [],
      includes: [],
      sorts: [],
      fields: [],
      params: {},
      useQuestionMark: true,
      pagination: {},
      ...(config ?? {}),
      pruneConflictingFilters: reverseConflicts(
        config?.pruneConflictingFilters ?? {},
      ),
      delimiters: {
        global: ",",
        fields: null,
        filters: null,
        sorts: null,
        includes: null,
        params: null,
        ...(config?.delimiters ?? {}),
      },
    };
  }

  private setState(fn: (s: GlobalState<Aliases>) => GlobalState<Aliases>) {
    this.state = fn(this.state);
    this.triggerSubscribers();
  }

  build(): string {
    return buildAction(this.state);
  }

  clearFields(): QueryBuilder<Aliases> {
    if (this.state.fields.length > 0) {
      this.setState((s) => clearFieldsAction(s));
    }
    return this;
  }

  clearFilters(): QueryBuilder<Aliases> {
    if (this.state.filters.length > 0) {
      this.setState((s) => {
        const state = this.shouldResetPage() ? pageAction(1, s) : s;

        return clearFiltersAction(state);
      });
    }
    return this;
  }

  clearIncludes(): QueryBuilder<Aliases> {
    if (this.state.includes.length > 0) {
      this.setState((s) => clearIncludeAction(s));
    }
    return this;
  }

  clearParams(): QueryBuilder<Aliases> {
    if (Object.keys(this.state.params).length > 0) {
      this.setState((s) => clearParamsAction(s));
    }
    return this;
  }

  clearSorts(): QueryBuilder<Aliases> {
    if (this.state.sorts.length > 0) {
      this.setState((s) => clearSortsAction(s));
    }

    return this;
  }

  fields(...fields: Field[]): QueryBuilder<Aliases> {
    const areNotEquals = _.difference(fields, this.state.fields).length !== 0;
    if (areNotEquals) {
      this.setState((s) => fieldAction(fields, s));
    }

    return this;
  }

  filter<TFilter extends FilterValue>(
    attribute: Aliases extends object
      ? (keyof Aliases & string) | string
      : string,
    value: TFilter,
    ...args: TFilter extends OperatorType
      ? [override: FilterValue]
      : [override?: boolean]
  ): QueryBuilder<Aliases> {
    const overrideValue = args[0];
    const filter = this.state.filters.find((f) => f.attribute === attribute);
    let filterValues: FilterValue;
    let shouldUpdate: boolean;

    if (isOperator(value)) {
      if (overrideValue === undefined || _.isBoolean(overrideValue)) {
        throw new Error(
          `The third argument is required when using an operator value received: '${overrideValue}'`,
        );
      }
      filterValues = Array.isArray(overrideValue)
        ? overrideValue
        : [overrideValue];
      shouldUpdate =
        filter?.operator !== value ||
        !_.isEmpty(_.xor(filter?.value, filterValues));
    } else {
      filterValues = Array.isArray(value) ? value : [value];
      const shouldOverride = overrideValue === true;

      if (shouldOverride) {
        shouldUpdate = !_.isEmpty(_.xor(filter?.value, filterValues));
      } else {
        // Append mode: check if there are new values to add
        const currentValues = filter?.value ?? [];
        const newValues = _.difference(filterValues, currentValues);
        shouldUpdate = newValues.length > 0;
      }
    }

    if (shouldUpdate) {
      this.setState((s) => {
        const state = this.shouldResetPage() ? pageAction(1, s) : s;
        return filterAction(
          attribute,
          isOperator(value) ? value : filterValues,
          state,
          isOperator(value) ? filterValues : (overrideValue ?? false),
        );
      });
    }

    return this;
  }

  getCurrentPage(): number | undefined {
    return this.state.pagination?.page;
  }
  getLimit(): number | undefined {
    return this.state.pagination?.limit;
  }

  hasField(...fields: Field[]): boolean {
    return hasField(fields, this.state);
  }

  hasFilter(
    ...filters: (Aliases extends object ? keyof Aliases | string : string)[]
  ): boolean {
    return hasFilter(filters, this.state);
  }

  hasInclude(...includes: Include[]): boolean {
    return hasInclude(includes, this.state);
  }

  hasParam(...params: string[]): boolean {
    return hasParam(params, this.state);
  }

  hasSort(
    ...sorts: (Aliases extends object
      ? (keyof Aliases & string) | string
      : string)[]
  ): boolean {
    return hasSort(sorts, this.state);
  }

  include(...includes: Include[]): QueryBuilder<Aliases> {
    const areNotEquals =
      _.difference(includes, this.state.includes).length !== 0;
    if (areNotEquals) {
      this.setState((s) => includeAction(includes, s));
    }
    return this;
  }

  limit(limit: number): QueryBuilder<Aliases> {
    if (this.state.pagination && limit != this.state.pagination?.limit) {
      this.setState((s) => {
        const state = this.shouldResetPage() ? pageAction(1, s) : s;
        return limitAction(limit, state);
      });
    }

    return this;
  }

  nextPage(): QueryBuilder<Aliases> {
    if (this.state.pagination?.page && this.state.pagination.page >= 1) {
      this.setState((s) =>
        pageAction(
          s.pagination?.page != undefined ? s.pagination.page + 1 : 1,
          s,
        ),
      );
    }
    return this;
  }

  page(page: number): QueryBuilder<Aliases> {
    if (this.state.pagination && page !== this.state.pagination?.page) {
      this.setState((s) => pageAction(page, s));
    }
    return this;
  }

  previousPage(): QueryBuilder<Aliases> {
    if (this.state.pagination?.page && this.state.pagination.page > 1) {
      this.setState((s) =>
        pageAction(s.pagination?.page ? s.pagination.page - 1 : 1, s),
      );
    }
    return this;
  }

  removeField(...fieldsToRemove: Field[]): QueryBuilder<Aliases> {
    const hasFieldToRemove =
      _.intersection(fieldsToRemove, this.state.fields).length !== 0;
    if (hasFieldToRemove) {
      this.setState((s) => removeFieldAction(fieldsToRemove, s));
    }
    return this;
  }

  removeFilter(
    ...filtersToRemove: (Aliases extends object
      ? (keyof Aliases & string) | string
      : string)[]
  ): QueryBuilder<Aliases> {
    if (
      this.state.filters.some((filter) =>
        filtersToRemove.includes(filter.attribute),
      )
    ) {
      this.setState((s) => {
        const state = this.shouldResetPage() ? pageAction(1, s) : s;
        return removeFilterAction(filtersToRemove, state);
      });
    }
    return this;
  }

  removeInclude(...includesToRemove: Include[]): QueryBuilder<Aliases> {
    const hasIncludeToRemove =
      _.intersection(includesToRemove, this.state.includes).length !== 0;
    if (hasIncludeToRemove) {
      this.setState((s) => removeIncludeAction(includesToRemove, s));
    }

    return this;
  }

  removeParam(...paramsToRemove: string[]): QueryBuilder<Aliases> {
    const hasParamToRemove = _.intersection(
      paramsToRemove,
      Object.keys(this.state.params),
    );
    if (hasParamToRemove) {
      this.setState((s) => removeParamAction(paramsToRemove, s));
    }
    return this;
  }

  removeSort(
    ...sortsToRemove: (Aliases extends object
      ? (keyof Aliases & string) | string
      : string)[]
  ): QueryBuilder<Aliases> {
    if (
      this.state.sorts.some((sort) => sortsToRemove.includes(sort.attribute))
    ) {
      this.setState((s) => removeSortAction(sortsToRemove, s));
    }
    return this;
  }

  setParam(
    key: string,
    value: (string | number)[] | string | number,
  ): QueryBuilder<Aliases> {
    const val = Array.isArray(value) ? value : [value];
    const areNotEquals =
      _.difference(this.state.params[key] ?? [], val).length !== 0;
    if (areNotEquals || !this.state.params[key]) {
      this.setState((s) => paramAction(key, val, s));
    }
    return this;
  }

  sort(
    attribute: Aliases extends object
      ? (keyof Aliases & string) | string
      : string,
    direction?: "asc" | "desc",
  ): QueryBuilder<Aliases> {
    const currentSort = this.state.sorts.find((f) => f.attribute === attribute);
    if (!currentSort || currentSort?.direction !== direction) {
      this.setState((s) =>
        sortAction({ attribute, direction: direction ?? "asc" }, s),
      );
    }
    return this;
  }

  tap(callback: (state: GlobalState<Aliases>) => void): QueryBuilder<Aliases> {
    callback(this.state);
    return this;
  }

  toArray(): string[] {
    return toArray(this.state);
  }

  when(
    condition: boolean,
    callback: (state: GlobalState<Aliases>) => void,
  ): QueryBuilder<Aliases> {
    whenAction(condition, callback, this.state);
    return this;
  }
  hasPagination(): boolean {
    return !!this.state.pagination;
  }

  private shouldResetPage(): boolean {
    return (
      Boolean(this.state.pagination) &&
      Boolean(this.state.pagination?.page) &&
      this.state.pagination?.page !== 1
    );
  }
}
