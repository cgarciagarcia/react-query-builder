import { type GlobalState } from "@/types";

export const pageAction = <Al>(
  page: number,
  state: GlobalState<Al>,
): GlobalState<Al> => ({
  ...state,
  pagination: {
    ...state.pagination,
    page,
  },
});

export const limitAction = <Al>(
  limit: number,
  state: GlobalState<Al>,
): GlobalState<Al> => ({
  ...state,
  pagination: {
    ...state.pagination,
    limit,
  },
});
