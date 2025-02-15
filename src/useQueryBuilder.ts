import { useRef, useState } from "react";
import { Builder } from "@/classes/Builder";
import { useMount } from "@/utils/useMount";
import { type BaseConfig, type QueryBuilder } from "./types";

export const useQueryBuilder = <Aliases>(
  config: BaseConfig<Aliases> = {},
): QueryBuilder<Aliases> => {
  const builder = useRef(new Builder<Aliases>(config));

  const [, setReRenders] = useState(0);

  useMount(() => {
    builder.current.addSubscriber(() => {
      setReRenders((r) => r + 1);
    });
  });

  return builder.current;
};
