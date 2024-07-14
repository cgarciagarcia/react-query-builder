import { type Alias, type Filter, type Includes, type Sorts } from "@/index";

export interface GlobalState<Al> {
  aliases: Alias<Al>;
  filters: Filter[];
  includes: Includes;
  sorts: Sorts;
}
