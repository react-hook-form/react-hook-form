import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import generateId from './logic/generateId';
import {
  UseWatchOptions,
  FieldValues,
  UnpackNestedValue,
  Control,
} from './types/types';
import { LiteralToPrimitive, DeepPartial } from './types/utils';

export function useWatch<TWatchFieldValues extends FieldValues>(props: {
  defaultValue?: UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
  control?: Control;
}): UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
export function useWatch<TWatchFieldValue extends any>(props: {
  name: string;
  control?: Control;
}): undefined | UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
export function useWatch<TWatchFieldValue extends any>(props: {
  name: string;
  defaultValue: UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
  control?: Control;
}): UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
export function useWatch<TWatchFieldValues extends FieldValues>(props: {
  name: string[];
  defaultValue?: UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
  control?: Control;
}): UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
export function useWatch<TWatchFieldValues>({
  control,
  name,
  defaultValue,
}: UseWatchOptions): TWatchFieldValues {
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
        watchInternal(nameRef.current, defaultValueRef.current, idRef.current),
      ),
    [setValue, watchInternal, defaultValueRef, nameRef, idRef],
  );

  React.useEffect(() => {
    const id = (idRef.current = generateId());
    const watchFieldsHookRender = watchFieldsHookRenderRef.current;
    const watchFieldsHook = watchFieldsHookRef.current;
    watchFieldsHook[id] = new Set();
    watchFieldsHookRender[id] = updateWatchValue;
    watchInternal(nameRef.current, defaultValueRef.current, id);

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

  return (isUndefined(value) ? defaultValue : value) as TWatchFieldValues;
}
