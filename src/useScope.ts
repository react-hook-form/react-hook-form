import React from 'react';

import { resolveScope } from './logic/createSelect';

export const useScope = <
  TControl,
  TName extends string | readonly string[] | undefined,
>(
  control: TControl,
  name: TName,
) => React.useMemo(() => resolveScope(control, name), [control, name]);
