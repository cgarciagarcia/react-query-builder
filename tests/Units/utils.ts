import { type BaseConfig, type GlobalState } from "@/types";

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
  pagination: {},
} as const;

export const initialConfig: BaseConfig = {
  aliases: {},
  includes: [],
  sorts: [],
  filters: [],
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
  pagination: undefined,
};
