import React from 'react';

// Keep the `typeof window` check (not `isWeb`): React Native defines `window`
// but not `document`, and useWatch/useFormState must subscribe in a layout
// effect there too, before regular effects such as a mount-time reset() run.
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
