import * as React from 'react';

import deepEqual from './utils/deepEqual';

export const useDeepEqualEffect = <T extends React.DependencyList>(
  effect: React.EffectCallback,
  deps: T,
) => {
  const ref = React.useRef<T>(deps);

  if (!deepEqual(deps, ref.current)) {
    ref.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, ref.current);
};
