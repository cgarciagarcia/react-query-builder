import { type GlobalState } from '@/types'

export const initialState: GlobalState = {
  aliases: {},
  filters: [],
  includes: [],
  sorts: [],
  fields: [],
  delimiters: {
    global: ',',
    fields: null,
    filters: null,
    sorts: null,
    includes: null,
    appends: null,
  }
} as const
