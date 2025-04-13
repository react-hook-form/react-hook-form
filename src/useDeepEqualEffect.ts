import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

import deepEqual from './utils/deepEqual';

export const useDeepEqualEffect = <T extends DependencyList>(
  effect: EffectCallback,
  deps: T,
) => {
  const ref = useRef<T>(deps);

  if (!deepEqual(deps, ref.current)) {
    ref.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, ref.current);
};
