import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import generateId from './logic/generateId';
import { Control, UseWatchProps } from './types';

export const useWatch = <ControlProp extends Control = Control>({
  control,
  name,
  defaultValue,
}: UseWatchProps<ControlProp>) => {
  const methods = useFormContext();
  const { watchFieldsHookRef, watchFieldsHookRenderRef, watchInternal } =
    control || methods.control;
  const [value, setValue] = React.useState(
    watchInternal(defaultValue, name, true),
  );

  React.useEffect(() => {
    const id = generateId();
    const watchFieldsHookRender = watchFieldsHookRenderRef.current;
    const watchFieldsHook = watchFieldsHookRef.current;
    watchFieldsHookRender[id] = setValue;

    return () => {
      watchFieldsHook.delete(name);
      delete watchFieldsHookRender[id];
    };
  }, [name, watchFieldsHookRenderRef, watchFieldsHookRef]);

  return { state: isUndefined(value) ? defaultValue : value };
};
