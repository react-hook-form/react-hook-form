import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import generateId from './logic/generateId';
import get from './utils/get';
import isArray from './utils/isArray';
import isObject from './utils/isObject';
import {
  DeepPartial,
  UseWatchOptions,
  FieldValues,
  UnpackNestedValue,
  Control,
} from './types';

export function useWatch<TWatchFieldValues extends FieldValues>(props: {
  defaultValue?: UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
  control?: Control;
}): UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
export function useWatch<TWatchFieldValue extends any>(props: {
  name: string;
  control?: Control;
}): undefined | UnpackNestedValue<TWatchFieldValue>;
export function useWatch<TWatchFieldValue extends any>(props: {
  name: string;
  defaultValue: UnpackNestedValue<TWatchFieldValue>;
  control?: Control;
}): UnpackNestedValue<TWatchFieldValue>;
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

  const {
    useWatchFieldsRef,
    useWatchRenderFunctionsRef,
    watchInternal,
    defaultValuesRef,
  } = control || methods.control;
  const [value, setValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? isString(name)
        ? get(defaultValuesRef.current, name)
        : isArray(name)
        ? name.reduce(
            (previous, inputName) => ({
              ...previous,
              [inputName]: get(defaultValuesRef.current, inputName),
            }),
            {},
          )
        : defaultValuesRef.current
      : defaultValue,
  );
  const idRef = React.useRef<string>();
  const defaultValueRef = React.useRef(defaultValue);

  const updateWatchValue = React.useCallback(() => {
    const value = watchInternal(name, defaultValueRef.current, idRef.current);
    setValue(
      isObject(value) ? { ...value } : isArray(value) ? [...value] : value,
    );
  }, [setValue, watchInternal, defaultValueRef, name, idRef]);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (!control && !methods) {
        throw new Error(
          '📋 useWatch is missing `control` prop. https://react-hook-form.com/api#useWatch',
        );
      }

      if (name === '') {
        console.warn(
          '📋 useWatch is missing `name` attribute. https://react-hook-form.com/api#useWatch',
        );
      }
    }

    const id = (idRef.current = generateId());
    const watchFieldsHookRender = useWatchRenderFunctionsRef.current;
    const watchFieldsHook = useWatchFieldsRef.current;
    watchFieldsHook[id] = new Set();
    watchFieldsHookRender[id] = updateWatchValue;
    watchInternal(name, defaultValueRef.current, id);

    return () => {
      delete watchFieldsHook[id];
      delete watchFieldsHookRender[id];
    };
  }, [
    name,
    updateWatchValue,
    useWatchRenderFunctionsRef,
    useWatchFieldsRef,
    watchInternal,
    defaultValueRef,
  ]);

  return (isUndefined(value) ? defaultValue : value) as TWatchFieldValues;
}
