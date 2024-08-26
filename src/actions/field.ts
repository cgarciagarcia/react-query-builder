import { type Fields, type GlobalState } from "@/types";

export const fieldAction = <Al>(
  fields: Fields,
  state: GlobalState<Al>,
): GlobalState<Al> => ({
  ...state,
  fields: [
    ...state.fields.filter((field) => !fields.includes(field)),
    ...fields,
  ],
});

export const removeFieldAction = <Al>(
  fields: Fields,
  state: GlobalState<Al>,
): GlobalState<Al> => ({
  ...state,
  fields: state.fields.filter((field) => !fields.includes(field)),
});

export const clearFieldsAction = <Al>(
  state: GlobalState<Al>,
): GlobalState<Al> => ({
  ...state,
  fields: [],
});
