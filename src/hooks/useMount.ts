import { useEffect, useRef } from "react";

export const useMount = (fn: () => void, deps: unknown[] = []) => {
  const onceFlagRef = useRef(true);

  useEffect(() => {
    if (onceFlagRef.current) {
      onceFlagRef.current = false;
      fn();
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, deps);
};
