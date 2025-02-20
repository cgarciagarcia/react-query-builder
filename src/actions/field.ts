import { type Field, type GlobalState } from "@/types";

export const fieldAction = <Al>(
  fields: Field[],
  state: GlobalState<Al>,
): GlobalState<Al> => {
  const uniqueFields = Array.from(new Set(fields));

  return {
    ...state,
    fields: [
      ...state.fields.filter((field) => !uniqueFields.includes(field)),
      ...uniqueFields,
    ],
  };
};

export const removeFieldAction = <Al>(
  fields: Field[],
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
