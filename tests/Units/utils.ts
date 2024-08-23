import { type GlobalState } from "@/types";

export const initialState: GlobalState = {
  aliases: {},
  filters: [],
  includes: [],
  sorts: [],
  fields: [],
  pruneConflictingFilters: {},
  delimiters: {
    global: ",",
    fields: null,
    filters: null,
    sorts: null,
    includes: null,
    params: null,
  },
  useQuestionMark: true,
  params: {},
} as const;
