import { type GlobalState } from "types";


export const build = <T>(state: GlobalState<T>): string => {
  const filters = state.filters.reduce(
    (acc, filter) => ({
      ...acc,
      [`filters[${filter.attribute}]`]: filter.value.join(","),
    }),
    {},
  );

  const sorts = state.sorts.reduce((acc, sort) => {
    const [attribute, dir] = sort;
    const direction = dir === "desc" ? "-" : "";
    acc.push(`${direction}${attribute}`);
    return acc;
  }, [] as string[]);

  const urlSearchParams = new URLSearchParams({
    ...filters,
  });

  if (sorts.length > 0) {
    urlSearchParams.append("sort", sorts.join(","));
  }

  const searchParamsString = urlSearchParams.toString();

  return searchParamsString ? "?" + urlSearchParams.toString() : "";
};
