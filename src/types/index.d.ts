export type Alias<Prop> = {
  [key in keyof Prop]: Prop[key] extends string ? string : never;
};
export type Sort = [string, "asc" | "desc"];
export type Sorts = Sort[];
export type Include = string
export type Includes = string[];
export type FilterValue = (string | number)[] | string | number;

export interface Filter {
  attribute: string;
  value: (string | number)[];
}

export interface GlobalState<Al> {
  aliases: Alias<Al>;
  filters: Filter[];
  includes: Includes;
  sorts: Sorts;
}

export type Actions = "sort" | "filter" | "clear_filter" | "include";
