import { type GlobalState } from "types";

export const usingAlias = <Al, K>(state: GlobalState<Al>, key: K) => {
  return (state.aliases[key as unknown as keyof Al] as string) ?? key;
};
