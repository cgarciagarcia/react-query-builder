import {
  FilterOperator,
  type GlobalState,
  type SearchParamsAdapterOptions,
} from "@/types";
import { DEFAULT_URL_KEYS } from "@/utils/parseSearchParams";
import { compilePolicy } from "@/utils/searchParamsPolicy";

const DELIMITER = ",";

/**
 * Pure inverse of `parseSearchParams`. Turns a (partial) `GlobalState` into a
 * query string using the same configurable keys (`filter`, `sort`, `include`,
 * `fields`) and the same `allowed` / `excludeKeys` policy applied
 * symmetrically — anything outside the policy never reaches the URL, so
 * round-tripping with `parseSearchParams` is always safe.
 *
 * Pagination (`page` / `limit`) is intentionally NOT written — same contract
 * as the parser. Add them to `allowed.params` and set them via `setParam` if
 * you want them on the URL.
 */
export const serializeSearchParams = <
  Aliases extends Record<string, string> | undefined = undefined,
>(
  state: Partial<GlobalState<Aliases>>,
  options?: SearchParamsAdapterOptions,
): string => {
  const keys = { ...DEFAULT_URL_KEYS, ...(options?.keys ?? {}) };
  const aliases = options?.aliases ?? state.aliases;
  const aliasOf = (name: string): string => aliases?.[name] ?? name;
  const { pass } = compilePolicy(options);
  const sp = new URLSearchParams();

  for (const filter of state.filters ?? []) {
    const wire = aliasOf(filter.attribute);
    if (!pass("filters", wire)) continue;
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
      if (pass("fields", field)) bare.push(field);
      continue;
    }
    const entity = field.slice(0, dotIdx);
    const prop = field.slice(dotIdx + 1);
    if (pass("fields", prop, field)) (grouped[entity] ??= []).push(prop);
  }
  if (bare.length > 0) sp.append(keys.fields, bare.join(DELIMITER));
  for (const [entity, props] of Object.entries(grouped)) {
    sp.append(`${keys.fields}[${entity}]`, props.join(DELIMITER));
  }

  const sortsKept = (state.sorts ?? []).filter((s) =>
    pass("sorts", aliasOf(s.attribute)),
  );
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

  const includesKept = (state.includes ?? []).filter((i) =>
    pass("includes", i),
  );
  if (includesKept.length > 0) {
    sp.append(keys.include, includesKept.join(DELIMITER));
  }

  for (const [k, v] of Object.entries(state.params ?? {})) {
    if (pass("params", k)) sp.append(k, v.join(DELIMITER));
  }

  const raw = sp.toString();
  return raw ? decodeURIComponent(raw) : "";
};
