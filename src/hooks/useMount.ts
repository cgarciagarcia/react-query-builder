import { useEffect, useRef } from "react";

export const useMount = (fn: () => void, deps: unknown[] = []) => {
  const onceFlag = useRef(true);

  useEffect(() => {
    if (onceFlag.current) {
      onceFlag.current = false;
      fn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
