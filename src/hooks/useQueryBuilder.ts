import { useEffect, useRef, useState } from "react";
import { Builder } from "@/classes/Builder";
import { type BaseConfig, type QueryBuilder } from "@/types";

export const useQueryBuilder = <
  Aliases extends Record<string, string> | undefined = undefined,
>(
  config?: BaseConfig<Aliases>,
): QueryBuilder<Aliases> => {
  const builder = useRef(new Builder<Aliases>(config));

  const [, setReRendersCounter] = useState(0);

  useEffect(() => {
    const instance = builder.current;
    const id = instance.addSubscriber(() => {
      setReRendersCounter((r) => r + 1);
    });
    return () => {
      instance.removeSubscriber(id);
    };
  }, []);

  return builder.current;
};
