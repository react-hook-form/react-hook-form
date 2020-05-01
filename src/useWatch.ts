import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import generateId from './logic/generateId';
import { Control, UseWatchProps } from './types';

export const useWatch = <TWatchValues, TControlProp extends Control = Control>({
  control,
  name,
  defaultValue,
}: UseWatchProps<TControlProp>): TWatchValues => {
  const methods = useFormContext();
  const { watchFieldsHookRef, watchFieldsHookRenderRef, watchInternal } =
    control || methods.control;
  const [value, setValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? isString(name)
        ? defaultValue
        : {}
      : defaultValue,
  );
  const idRef = React.useRef<string>();
  const defaultValueRef = React.useRef(defaultValue);
  const nameRef = React.useRef(name);

  const updateWatchValue = React.useCallback(
    () =>
      setValue(
        watchInternal(defaultValueRef.current, nameRef.current, idRef.current),
      ),
    [setValue, watchInternal, defaultValueRef, nameRef, idRef],
  );

  React.useEffect(() => {
    const id = (idRef.current = generateId());
    const watchFieldsHookRender = watchFieldsHookRenderRef.current;
    const watchFieldsHook = watchFieldsHookRef.current;
    watchFieldsHook[id] = new Set();
    watchFieldsHookRender[id] = updateWatchValue;
    watchInternal(defaultValueRef.current, nameRef.current, id);

    return () => {
      delete watchFieldsHook[id];
      delete watchFieldsHookRender[id];
    };
  }, [
    nameRef,
    updateWatchValue,
    watchFieldsHookRenderRef,
    watchFieldsHookRef,
    watchInternal,
    defaultValueRef,
  ]);

  return (isUndefined(value) ? defaultValue : value) as TWatchValues;
};
