import { buildAction } from "@/actions/build";
import { type GlobalState } from "@/types";

export const toArray = <Al>(state: GlobalState<Al>): string[] => {
  const url = buildAction({ ...state, useQuestionMark: false });
  return url ? url.split("&") : [];
};
