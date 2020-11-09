import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import generateId from './logic/generateId';
import get from './utils/get';
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

  if (process.env.NODE_ENV !== 'production') {
    if (!control && !methods) {
      throw new Error(
        '📋 useWatch is missing `control` prop. https://react-hook-form.com/api#useWatch',
      );
    }
  }

  const {
    useWatchFieldsRef,
    useWatchRenderFunctionsRef,
    watchInternal,
    defaultValuesRef,
  } = control || methods.control;
  const updateValue = React.useState<unknown>()[1];
  const idRef = React.useRef<string>();
  const defaultValueRef = React.useRef(defaultValue);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
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
    watchFieldsHookRender[id] = () => updateValue({});
    watchInternal(name, defaultValueRef.current, id);

    return () => {
      delete watchFieldsHook[id];
      delete watchFieldsHookRender[id];
    };
  }, [
    name,
    useWatchRenderFunctionsRef,
    useWatchFieldsRef,
    watchInternal,
    defaultValueRef,
  ]);

  return idRef.current
    ? watchInternal(name, defaultValueRef.current, idRef.current)
    : isUndefined(defaultValue)
    ? isString(name)
      ? get(defaultValuesRef.current, name)
      : Array.isArray(name)
      ? name.reduce(
          (previous, inputName) => ({
            ...previous,
            [inputName]: get(defaultValuesRef.current, inputName),
          }),
          {},
        )
      : defaultValuesRef.current
    : defaultValue;
}
