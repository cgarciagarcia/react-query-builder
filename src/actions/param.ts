import { type GlobalState } from "@/types";

export const paramAction = <Al>(
  key: string,
  value: (string | number)[] | string | number,
  state: GlobalState<Al>,
): GlobalState<Al> => ({
  ...state,
  params: {
    ...state.params,
    [key]: Array.isArray(value) ? value : [value],
  },
});

export const removeParamAction = <Al>(
  keys: string[],
  state: GlobalState<Al>,
): GlobalState<Al> => ({
  ...state,
  params: Object.fromEntries(
    Object.entries(state.params).filter(([key, _]) => !keys.includes(key)),
  ),
});

export const clearParamsAction = <Al>(
  state: GlobalState<Al>,
): GlobalState<Al> => ({
  ...state,
  params: {},
});
