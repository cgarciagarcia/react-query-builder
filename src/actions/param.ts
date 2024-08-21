import { type Alias, type GlobalState } from "@/types";

export const paramAction = <Al extends Alias<object>>(
  key: string,
  value: (string | number)[] | string | number,
  state: GlobalState<Al>,
) => {
  return {
    ...state,
    params: {
      ...state.params,
      [key]: Array.isArray(value) ? value : [value],
    },
  } satisfies GlobalState<Al>;
};

export const removeParamAction = <Al extends Alias<object>>(
  keys: string[],
  state: GlobalState<Al>,
) => {
  const newParams = Object.fromEntries(
    Object.entries(state.params).filter(([key, _]) => !keys.includes(key)),
  );
  return {
    ...state,
    params: newParams,
  } satisfies GlobalState<Al>;
};

export const clearParamsAction = <Al extends Alias<object>>(
  state: GlobalState<Al>,
) => {
  return {
    ...state,
    params: {},
  } satisfies GlobalState<Al>;
};
