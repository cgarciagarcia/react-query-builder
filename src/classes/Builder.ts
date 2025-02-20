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
> implements QueryBuilder<Aliases>
{
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

  constructor(config?: BaseConfig<Aliases> | BaseConfig<unknown>) {
    this.state = {
      //@ts-expect-error: Type 'unknown' is not assignable to type 'Aliases'
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
      this.setState((s) => clearFiltersAction(s));
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

  filter(
    attribute: Aliases extends object
      ? (keyof Aliases & string) | string
      : string,
    value: FilterValue,
    override?: boolean | FilterValue,
  ): QueryBuilder<Aliases> {
    const filter = this.state.filters.find((f) => f.attribute === attribute);
    const filterValues = Array.isArray(value) ? value : [value];
    const areEquals = _.isEmpty(_.xor(filter?.value, filterValues));

    if (!areEquals) {
      this.setState((s) => filterAction(attribute, filterValues, s, override));
    }

    return this;
  }

  getCurrentPage(): number | undefined {
    return this.state.pagination?.page ?? undefined;
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
      this.setState((s) => limitAction(limit, s));
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
      this.setState((s) => removeFilterAction(filtersToRemove, s));
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
    direction: "asc" | "desc" | undefined,
  ): QueryBuilder<Aliases> {
    const currentSort = this.state.sorts.find((f) => f.attribute === attribute);
    if (currentSort?.direction !== direction) {
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
}
