import { useRef, useState } from "react";
import { Builder } from "@/classes/Builder";
import { useMount } from "@/hooks/useMount";
import { type BaseConfig, type QueryBuilder } from "src/types";

export const useQueryBuilder = <
  Aliases extends Record<string, string> | undefined = undefined,
>(
  config?: BaseConfig<Aliases>,
): QueryBuilder<Aliases> => {
  const builder = useRef(new Builder<Aliases>(config));

  const [, setReRendersCounter] = useState(0);

  useMount(() => {
    builder.current.addSubscriber(() => {
      setReRendersCounter((r) => r + 1);
    });
  });

  return builder.current;
};
