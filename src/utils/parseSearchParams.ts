import {
  FilterOperator,
  type ConfigurableURLKey,
  type Field,
  type Filter,
  type GlobalState,
  type Include,
  type OperatorType,
  type SearchParamsAdapterOptions,
  type Sort,
} from "@/types";
import { compilePolicy } from "@/utils/searchParamsPolicy";

export const DEFAULT_URL_KEYS: Record<ConfigurableURLKey, string> = {
  filter: "filter",
  sort: "sort",
  include: "include",
  fields: "fields",
};

const OPERATOR_PREFIXES: OperatorType[] = (
  Object.values(FilterOperator) as OperatorType[]
)
  .filter((op) => op !== FilterOperator.Equals)
  .sort((a, b) => b.length - a.length);

const splitCsv = (raw: string): string[] => (raw === "" ? [] : raw.split(","));

const extractOperator = (
  raw: string,
): { operator?: OperatorType; rest: string } => {
  for (const op of OPERATOR_PREFIXES) {
    if (raw.startsWith(op)) return { operator: op, rest: raw.slice(op.length) };
  }
  return { rest: raw };
};

const bracketedKey = (paramKey: string, prefix: string): string | null =>
  paramKey.startsWith(`${prefix}[`) && paramKey.endsWith("]")
    ? paramKey.slice(prefix.length + 1, -1)
    : null;

const buildReverseAliases = (
  aliases: Record<string, string> | undefined,
): Map<string, string> => {
  const reverse = new Map<string, string>();
  for (const [frontend, backend] of Object.entries(aliases ?? {})) {
    if (!reverse.has(backend)) reverse.set(backend, frontend);
  }
  return reverse;
};

export const parseSearchParams = <
  Aliases extends Record<string, string> | undefined = undefined,
>(
  search: string,
  options?: SearchParamsAdapterOptions,
): Partial<GlobalState<Aliases>> => {
  const trimmed = search.replace(/^\?/, "").trim();
  if (trimmed === "") return {};

  const keys = { ...DEFAULT_URL_KEYS, ...(options?.keys ?? {}) };
  const { pass } = compilePolicy(options);
  const reverse = buildReverseAliases(options?.aliases);
  const aliasOf = (name: string): string => reverse.get(name) ?? name;

  const filters: Filter<Aliases>[] = [];
  const fields: Field[] = [];
  const sorts: Sort<Aliases>[] = [];
  const includes: Include[] = [];
  const collectedParams: Record<string, (string | number)[]> = {};

  for (const [key, rawValue] of new URLSearchParams(trimmed).entries()) {
    const filterAttr = bracketedKey(key, keys.filter);
    if (filterAttr !== null) {
      if (!pass("filters", filterAttr)) continue;
      const { operator, rest } = extractOperator(rawValue);
      filters.push({
        attribute: aliasOf(filterAttr) as Filter<Aliases>["attribute"],
        value: splitCsv(rest),
        ...(operator ? { operator } : {}),
      });
      continue;
    }

    const fieldEntity = bracketedKey(key, keys.fields);
    if (fieldEntity !== null) {
      for (const prop of splitCsv(rawValue)) {
        const full = `${fieldEntity}.${prop}`;
        if (pass("fields", prop, full)) fields.push(full);
      }
      continue;
    }

    if (key === keys.fields) {
      for (const f of splitCsv(rawValue)) {
        if (pass("fields", f)) fields.push(f);
      }
      continue;
    }

    if (key === keys.sort) {
      for (const item of splitCsv(rawValue)) {
        const desc = item.startsWith("-");
        const attr = desc ? item.slice(1) : item;
        if (!pass("sorts", attr)) continue;
        sorts.push({
          attribute: aliasOf(attr) as Sort<Aliases>["attribute"],
          direction: desc ? "desc" : "asc",
        });
      }
      continue;
    }

    if (key === keys.include) {
      for (const inc of splitCsv(rawValue)) {
        if (pass("includes", inc)) includes.push(inc);
      }
      continue;
    }

    if (pass("params", key)) collectedParams[key] = splitCsv(rawValue);
  }

  const result: Partial<GlobalState<Aliases>> = {};
  if (filters.length > 0) result.filters = filters;
  if (fields.length > 0) result.fields = fields;
  if (sorts.length > 0) result.sorts = sorts;
  if (includes.length > 0) result.includes = includes;
  if (Object.keys(collectedParams).length > 0) result.params = collectedParams;

  return result;
};
