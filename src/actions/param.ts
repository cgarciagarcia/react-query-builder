import { type GlobalState } from "@/types";

export const paramAction = <Al>(
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

export const removeParamAction = <Al>(
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

export const clearParamsAction = <Al>(state: GlobalState<Al>) => {
  return {
    ...state,
    params: {},
  } satisfies GlobalState<Al>;
};
