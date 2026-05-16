import {
  FilterOperator,
  type GlobalState,
  type SearchParamsAdapterOptions,
} from "@/types";
import { DEFAULT_URL_KEYS } from "@/utils/parseSearchParams";

const DELIMITER = ",";

const groupFields = (
  fields: string[],
): { bare: string[]; grouped: Record<string, string[]> } => {
  const bare: string[] = [];
  const grouped: Record<string, string[]> = {};
  for (const field of fields) {
    const dotIdx = field.indexOf(".");
    if (dotIdx === -1) {
      bare.push(field);
      continue;
    }
    const entity = field.slice(0, dotIdx);
    const prop = field.slice(dotIdx + 1);
    grouped[entity] = grouped[entity] ?? [];
    grouped[entity].push(prop);
  }
  return { bare, grouped };
};

/**
 * Pure inverse of `parseSearchParams`. Turns a (partial) `GlobalState` into a
 * query string using the same configurable keys (`filter`, `sort`, `include`,
 * `fields`) and the same allowlist semantics for `params` (only keys listed in
 * `allowedParams` are written, keeping the URL round-trippable with the
 * matching `parseSearchParams` call).
 *
 * Pagination (`page` / `limit`) is intentionally NOT written — same contract
 * as the parser. Add them to `allowedParams` and set them via `setParam` if
 * you want them on the URL.
 */
export const serializeSearchParams = <
  Aliases extends Record<string, string> | undefined = undefined,
>(
  state: Partial<GlobalState<Aliases>>,
  options?: SearchParamsAdapterOptions,
): string => {
  const keys = { ...DEFAULT_URL_KEYS, ...(options?.keys ?? {}) };
  const allowed = new Set(options?.allowedParams ?? []);
  const aliases = options?.aliases ?? state.aliases;
  const aliasOf = (name: string): string => aliases?.[name] ?? name;
  const sp = new URLSearchParams();

  for (const filter of state.filters ?? []) {
    const op =
      filter.operator && filter.operator !== FilterOperator.Equals
        ? filter.operator
        : "";
    sp.append(
      `${keys.filter}[${aliasOf(filter.attribute)}]`,
      op + filter.value.join(DELIMITER),
    );
  }

  const { bare, grouped } = groupFields(state.fields ?? []);
  if (bare.length > 0) sp.append(keys.fields, bare.join(DELIMITER));
  for (const [entity, props] of Object.entries(grouped)) {
    sp.append(`${keys.fields}[${entity}]`, props.join(DELIMITER));
  }

  const sorts = state.sorts ?? [];
  if (sorts.length > 0) {
    sp.append(
      keys.sort,
      sorts
        .map(
          (s) => `${s.direction === "desc" ? "-" : ""}${aliasOf(s.attribute)}`,
        )
        .join(DELIMITER),
    );
  }

  const includes = state.includes ?? [];
  if (includes.length > 0) {
    sp.append(keys.include, includes.join(DELIMITER));
  }

  for (const [k, v] of Object.entries(state.params ?? {})) {
    if (allowed.has(k)) sp.append(k, v.join(DELIMITER));
  }

  const raw = sp.toString();
  return raw ? decodeURIComponent(raw) : "";
};
