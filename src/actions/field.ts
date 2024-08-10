import { type Alias, type Fields, type GlobalState } from "@/types";

export const fieldAction = <Al extends Alias<object>>(
  fields: Fields,
  state: GlobalState<Al>,
) => {
  return {
    ...state,
    fields: [
      ...state.fields.filter((field) => !fields.includes(field)),
      ...fields,
    ],
  } satisfies GlobalState<Al>;
};

export const removeFieldAction = <Al extends Alias<object>>(
  fields: Fields,
  state: GlobalState<Al>,
) => {
  return {
    ...state,
    fields: state.fields.filter((field) => !fields.includes(field)),
  } satisfies GlobalState<Al>;
};

export const clearFieldsAction = <Al extends Alias<object>>(
  state: GlobalState<Al>,
) => {
  return {
    ...state,
    fields: [],
  } satisfies GlobalState<Al>;
};
