import { useReducer, useState } from "react";

import {
  type Actions,
  type Alias,
  build,
  clearFilterAction,
  type Filter,
  filterAction,
  type FilterValue,
  type GlobalState,
  includeAction,
  type Includes,
  type Sort,
  sortAction,
} from "@/index";


interface Action {
  type: Actions;
  payload: unknown;

}

const reducer = <Aliases extends Record<string, string>>(
  state: GlobalState<Aliases>,
  action: Action,
) => {
  switch (action?.type) {
    case "filter": {
      const filter = action.payload as Filter;
      return filterAction(filter.attribute, filter.value, state);
    }
    case "clear_filter": {
      return clearFilterAction(state);
    }
    case "include": {
      const includes = action.payload as Includes;
      return includeAction(includes, state);
    }
    case "sort": {
      const sorts = action.payload as Sort;
      return sortAction(sorts, state);
    }
    default: {
      return { ...state };
    }
  }

};

const initialState = <T>(): GlobalState<T> => ({
  aliases: {} as Alias<T>,
  filters: [],
  includes: [],
  sorts: [],
});

export interface QueryBuilder<AliasType = NonNullable<unknown>> {
  filters: (
    attribute: keyof AliasType | string,
    value: FilterValue,
  ) => QueryBuilder<AliasType>;
  build: () => string;
  clearFilters: () => QueryBuilder<AliasType>;
  includes: (includes: Includes) => QueryBuilder<AliasType>;
  sorts: (
    attribute: string,
    direction?: "asc" | "desc",
  ) => QueryBuilder<AliasType>;
}

type ExtensibleQueryProps<T> = Pick<
  QueryBuilder<T>,
  "filters" | "includes" | "sorts"
>;

interface QueryBuilderProps<AliasType> extends ExtensibleQueryProps<AliasType> {
  aliases?: AliasType;
}

export const useQueryBuilder: <Aliases extends Record<string, string>>(
  config?: QueryBuilderProps<Aliases>,
) => QueryBuilder<Aliases> = <Aliases extends Record<string, string>>(
  config = {} as QueryBuilderProps<Aliases>,
) => {
  const [init] = useState(() => initialState<Aliases>());
  const [state, dispatch] = useReducer(reducer, init, (init) => ({
    ...init,
    aliases: config?.aliases ?? ({} as Aliases),
  }));

  const builder: QueryBuilder<Aliases> = {
    filters: (attribute, value) => {
      dispatch({
        type: "filter",
        payload: { attribute, value },
      });
      return builder;
    },
    build: () => build(state),
    clearFilters: () => {
      dispatch({
        type: "clear_filter",
        payload: undefined,
      });
      return builder;
    },
    includes: (includes) => {
      dispatch({
        type: "include",
        payload: includes,
      });
      return builder;
    },
    sorts: (attribute, direction) => {
      dispatch({
        type: "sort",
        payload: [attribute, direction ?? "asc"],
      });
      return builder;
    },
  };

  return builder;
};
