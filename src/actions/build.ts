import { type GlobalState } from "@/types";
import { usingAlias } from "@/utils/alias";

export const buildAction = <T>(state: GlobalState<T>): string => {
  const delimiter = (type: keyof GlobalState<T>["delimiters"]) =>
    state.delimiters[type] ?? state.delimiters.global;

  const filters = Object.fromEntries(
    state.filters.map((filter) => [
      `filter[${usingAlias(state, filter.attribute)}]`,
      filter.value.join(delimiter("filters")),
    ]),
  );

  const fields = state.fields.reduce<Record<string, string[]>>((acc, field) => {
    const [entity, prop] = field.split(".") as [string, string];
    if (prop) {
      acc[`fields[${entity}]`] = [...(acc[`fields[${entity}]`] ?? []), prop];
    } else {
      acc.fields = [...(acc.fields ?? []), entity];
    }
    return acc;
  }, {});

  const fieldsToString = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      value.join(delimiter("fields")),
    ]),
  );

  const urlSearchParams = new URLSearchParams({
    ...filters,
    ...fieldsToString,
  });

  const sorts = state.sorts.map(
    ({ attribute, direction }) =>
      `${direction === "desc" ? "-" : ""}${usingAlias(state, attribute)}`,
  );

  if (sorts.length > 0) {
    urlSearchParams.append("sort", sorts.join(delimiter("sorts")));
  }

  if (state.includes.length > 0) {
    urlSearchParams.append(
      "include",
      state.includes.join(delimiter("includes")),
    );
  }

  for (const [key, value] of Object.entries(state.params)) {
    urlSearchParams.append(key, value.join(delimiter("params")));
  }

  const searchParamsString = urlSearchParams.toString();

  return searchParamsString
    ? (state.useQuestionMark ? "?" : "") +
        decodeURIComponent(searchParamsString)
    : "";
};
