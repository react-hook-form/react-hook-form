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
  const [value, setValue] = React.useState<unknown>();

  React.useEffect(() => {
    const id = generateId();
    const watchFieldsHookRender = watchFieldsHookRenderRef.current;
    const watchFieldsHook = watchFieldsHookRef.current;
    watchFieldsHook[id] = new Set();
    watchFieldsHookRender[id] = setValue;
    setValue(watchInternal(defaultValue, name, id));

    return () => {
      delete watchFieldsHook[id];
      delete watchFieldsHookRender[id];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, watchFieldsHookRenderRef, watchFieldsHookRef]);

  return { state: isUndefined(value) ? defaultValue : value };
};
