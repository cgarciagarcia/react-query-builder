import {
  FilterOperator,
  type GlobalState,
  type SearchParamsAdapterOptions,
} from "@/types";
import { DEFAULT_URL_KEYS, prettifyBrackets } from "@/utils/parseSearchParams";
import { compilePolicy, type PolicyGate } from "@/utils/searchParamsPolicy";

const DELIMITER = ",";

/**
 * Pure inverse of `parseSearchParams`. Turns a (partial) `GlobalState` into a
 * query string using the same configurable keys (`filter`, `sort`, `include`,
 * `fields`) and the same `allowed` / `excludeKeys` policy applied
 * symmetrically — anything outside the policy never reaches the URL, so
 * round-tripping with `parseSearchParams` is always safe.
 *
 * Also honours `urlOmit`: entries listed there are dropped from the output
 * but stay in the builder state (so `.build()` still emits them for the
 * API). Use it to keep the URL bar clean while feeding the backend the
 * context it needs.
 *
 * Pagination (`page` / `limit`) is emitted unconditionally when set, so a
 * link like `/list?page=3` round-trips back into `state.pagination`.
 */
export const serializeSearchParams = <
  Aliases extends Record<string, string> | undefined = undefined,
>(
  state: Partial<GlobalState<Aliases>>,
  options?: SearchParamsAdapterOptions,
  policy?: PolicyGate,
): string => {
  const keys = { ...DEFAULT_URL_KEYS, ...(options?.keys ?? {}) };
  const aliases = options?.urlAliases ?? state.aliases;
  const aliasOf = (name: string): string => aliases?.[name] ?? name;
  const { pass, omit } = policy ?? compilePolicy(options);
  const sp = new URLSearchParams();

  for (const filter of state.filters ?? []) {
    const wire = aliasOf(filter.attribute);
    if (omit("filters", filter.attribute, wire)) continue;
    if (!pass("filters", filter.attribute, wire)) continue;
    const op =
      filter.operator && filter.operator !== FilterOperator.Equals
        ? filter.operator
        : "";
    sp.append(`${keys.filter}[${wire}]`, op + filter.value.join(DELIMITER));
  }

  const bare: string[] = [];
  const grouped: Record<string, string[]> = {};
  for (const field of state.fields ?? []) {
    const dotIdx = field.indexOf(".");
    if (dotIdx === -1) {
      if (omit("fields", field)) continue;
      if (pass("fields", field)) bare.push(field);
      continue;
    }
    const entity = field.slice(0, dotIdx);
    const prop = field.slice(dotIdx + 1);
    if (omit("fields", prop, field)) continue;
    if (pass("fields", prop, field)) (grouped[entity] ??= []).push(prop);
  }
  if (bare.length > 0) sp.append(keys.fields, bare.join(DELIMITER));
  for (const [entity, props] of Object.entries(grouped)) {
    sp.append(`${keys.fields}[${entity}]`, props.join(DELIMITER));
  }

  const sortsKept = (state.sorts ?? []).filter((s) => {
    const wire = aliasOf(s.attribute);
    return (
      !omit("sorts", s.attribute, wire) && pass("sorts", s.attribute, wire)
    );
  });
  if (sortsKept.length > 0) {
    sp.append(
      keys.sort,
      sortsKept
        .map(
          (s) => `${s.direction === "desc" ? "-" : ""}${aliasOf(s.attribute)}`,
        )
        .join(DELIMITER),
    );
  }

  const includesKept = (state.includes ?? []).filter(
    (i) => !omit("includes", i) && pass("includes", i),
  );
  if (includesKept.length > 0) {
    sp.append(keys.include, includesKept.join(DELIMITER));
  }

  for (const [k, v] of Object.entries(state.params ?? {})) {
    if (omit("params", k)) continue;
    if (pass("params", k)) sp.append(k, v.join(DELIMITER));
  }

  if (state.pagination?.page !== undefined) {
    sp.append("page", String(state.pagination.page));
  }
  if (state.pagination?.limit !== undefined) {
    sp.append("limit", String(state.pagination.limit));
  }

  const raw = sp.toString();
  return raw ? prettifyBrackets(raw) : "";
};
