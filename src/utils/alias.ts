import { type GlobalState } from "@/index";

export const usingAlias = <Al, K>(state: GlobalState<Al>, key: K) => {
  return (state.aliases[key as unknown as keyof Al] as string) ?? key;
};


export type Alias<Prop> = {
  [key in keyof Prop]: Prop[key] extends string ? string : never;
};

