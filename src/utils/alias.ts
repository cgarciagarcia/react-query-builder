import { type GlobalState } from "@/types";

export const usingAlias = <Al>(state: GlobalState<Al>, key: string): string => {
  const aliases = state.aliases as Record<string, string> | undefined;
  return aliases?.[key] ?? key;
};
