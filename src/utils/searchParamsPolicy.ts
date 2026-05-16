import { type SearchParamsAdapterOptions } from "@/types";

const BUCKETS = ["filters", "sorts", "includes", "fields", "params"] as const;
type Bucket = (typeof BUCKETS)[number];

export interface PolicyGate {
  /**
   * Returns `true` iff the entry should be kept for `bucket`. Multiple
   * candidate names are accepted for `fields` (short prop OR `entity.prop`).
   *
   * Rules (in order):
   * 1. Any candidate in `excludeKeys[bucket]` → drop.
   * 2. If `allowed[bucket]` is defined → at least one candidate must be in it.
   * 3. Otherwise: bucket default applies — allow-all for filters/sorts/
   *    includes/fields, deny-all for params (params is a catch-all so the
   *    safe default is "nothing comes through unless explicitly listed").
   */
  pass: (bucket: Bucket, ...candidates: string[]) => boolean;
}

export const compilePolicy = (
  options?: SearchParamsAdapterOptions,
): PolicyGate => {
  const allowed = {} as Record<Bucket, Set<string> | null>;
  const excluded = {} as Record<Bucket, Set<string>>;
  for (const b of BUCKETS) {
    const allow = options?.allowed?.[b];
    allowed[b] = allow ? new Set(allow) : null;
    excluded[b] = new Set(options?.excludeKeys?.[b] ?? []);
  }

  return {
    pass: (bucket, ...candidates) => {
      if (candidates.some((c) => excluded[bucket].has(c))) return false;
      const allow = allowed[bucket];
      if (allow !== null) return candidates.some((c) => allow.has(c));
      return bucket !== "params";
    },
  };
};
