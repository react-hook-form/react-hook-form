import * as React from 'react';

export function useReRender(isUnMount: React.MutableRefObject<boolean>) {
  const [, render] = React.useState();
  const reRender = React.useCallback(() => {
    if (!isUnMount.current) {
      render({});
    }
  }, [isUnMount]);

  return reRender;
}
