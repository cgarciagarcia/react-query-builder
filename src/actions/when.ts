import { type GlobalState } from "@/types";

export const whenAction = <Al>(
  condition: boolean,
  callback: (state: GlobalState<Al>) => void,
  state: GlobalState<Al>,
): void => {
  if (condition) {
    callback(state);
  }
};
