import { type Fields, type GlobalState } from "@/types";

export const fieldAction = <Al>(fields: Fields, state: GlobalState<Al>) => {
  return {
    ...state,
    fields: [
      ...state.fields.filter((field) => !fields.includes(field)),
      ...fields,
    ],
  } satisfies GlobalState<Al>;
};

export const removeFieldAction = <Al>(
  fields: Fields,
  state: GlobalState<Al>,
) => {
  return {
    ...state,
    fields: state.fields.filter((field) => !fields.includes(field)),
  } satisfies GlobalState<Al>;
};

export const clearFieldsAction = <Al>(state: GlobalState<Al>) => {
  return {
    ...state,
    fields: [],
  } satisfies GlobalState<Al>;
};
