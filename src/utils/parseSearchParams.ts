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

const DEFAULT_KEYS: Record<ConfigurableURLKey, string> = {
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

const stripLeadingQuestion = (search: string): string =>
  search.startsWith("?") ? search.slice(1) : search;

const splitCsv = (raw: string): string[] => (raw === "" ? [] : raw.split(","));

const extractOperator = (
  raw: string,
): { operator?: OperatorType; rest: string } => {
  for (const op of OPERATOR_PREFIXES) {
    if (raw.startsWith(op)) {
      return { operator: op as OperatorType, rest: raw.slice(op.length) };
    }
  }
  return { rest: raw };
};

const bracketedKey = (paramKey: string, prefix: string): string | null => {
  if (!paramKey.startsWith(`${prefix}[`) || !paramKey.endsWith("]")) {
    return null;
  }
  return paramKey.slice(prefix.length + 1, -1);
};

export const parseSearchParams = <
  Aliases extends Record<string, string> | undefined = undefined,
>(
  search: string,
  options?: SearchParamsAdapterOptions,
): Partial<GlobalState<Aliases>> => {
  const trimmed = stripLeadingQuestion(search).trim();
  if (trimmed === "") return {};

  const keys = { ...DEFAULT_KEYS, ...(options?.keys ?? {}) };
  const allowed = new Set(options?.allowedParams ?? []);
  const params = new URLSearchParams(trimmed);

  const filters: Filter<Aliases>[] = [];
  const fields: Field[] = [];
  const sorts: Sort<Aliases>[] = [];
  const includes: Include[] = [];
  const collectedParams: Record<string, (string | number)[]> = {};

  for (const [key, rawValue] of params.entries()) {
    const filterAttr = bracketedKey(key, keys.filter);
    if (filterAttr !== null) {
      const { operator, rest } = extractOperator(rawValue);
      filters.push({
        attribute: filterAttr as Filter<Aliases>["attribute"],
        value: splitCsv(rest),
        ...(operator ? { operator } : {}),
      });
      continue;
    }

    const fieldEntity = bracketedKey(key, keys.fields);
    if (fieldEntity !== null) {
      for (const prop of splitCsv(rawValue)) {
        fields.push(`${fieldEntity}.${prop}`);
      }
      continue;
    }

    if (key === keys.fields) {
      for (const f of splitCsv(rawValue)) {
        fields.push(f);
      }
      continue;
    }

    if (key === keys.sort) {
      for (const item of splitCsv(rawValue)) {
        const desc = item.startsWith("-");
        sorts.push({
          attribute: (desc
            ? item.slice(1)
            : item) as Sort<Aliases>["attribute"],
          direction: desc ? "desc" : "asc",
        });
      }
      continue;
    }

    if (key === keys.include) {
      for (const inc of splitCsv(rawValue)) {
        includes.push(inc);
      }
      continue;
    }

    if (allowed.has(key)) {
      collectedParams[key] = splitCsv(rawValue);
    }
  }

  const result: Partial<GlobalState<Aliases>> = {};
  if (filters.length > 0) result.filters = filters;
  if (fields.length > 0) result.fields = fields;
  if (sorts.length > 0) result.sorts = sorts;
  if (includes.length > 0) result.includes = includes;
  if (Object.keys(collectedParams).length > 0) result.params = collectedParams;

  return result;
};
