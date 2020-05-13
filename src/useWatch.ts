import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import generateId from './logic/generateId';
import {
  UseWatchOptions,
  FieldValuesFromControl,
  UnpackNestedValue,
  Control,
  DeepPartial,
  LiteralToPrimitive,
} from './types';

export function useWatch<
  TWatchFieldValues extends FieldValuesFromControl<TControl>,
  TControl extends Control = Control
>(props: {
  control?: TControl;
}): UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
export function useWatch<
  TWatchFieldValues extends FieldValuesFromControl<TControl>,
  TControl extends Control = Control
>(props: {
  defaultValue: UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
  control?: TControl;
}): UnpackNestedValue<TWatchFieldValues>;
export function useWatch<
  TWatchFieldValue extends FieldValuesFromControl<TControl>[TFieldName],
  TFieldName extends string = string,
  TControl extends Control = Control
>(props: {
  name: TFieldName;
  control?: TControl;
}): undefined | UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
export function useWatch<
  TWatchFieldValue extends FieldValuesFromControl<TControl>[TFieldName],
  TFieldName extends string = string,
  TControl extends Control = Control
>(props: {
  name: TFieldName;
  defaultValue: UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
  control?: TControl;
}): UnpackNestedValue<LiteralToPrimitive<TWatchFieldValue>>;
export function useWatch<
  TWatchFieldValues extends FieldValuesFromControl<TControl>,
  TFieldName extends keyof TWatchFieldValues = keyof TWatchFieldValues,
  TControl extends Control = Control
>(props: {
  name: TFieldName[];
  control?: TControl;
}): UnpackNestedValue<DeepPartial<Pick<TWatchFieldValues, TFieldName>>>;
export function useWatch<
  TWatchFieldValues extends FieldValuesFromControl<TControl>,
  TFieldName extends keyof TWatchFieldValues = keyof TWatchFieldValues,
  TControl extends Control = Control
>(props: {
  name: TFieldName[];
  defaultValue: UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
  control?: TControl;
}): UnpackNestedValue<Pick<TWatchFieldValues, TFieldName>>;
export function useWatch<
  TWatchFieldValues extends FieldValuesFromControl<TControl>,
  TFieldName extends string = string,
  TControl extends Control = Control
>(props: {
  name: TFieldName[];
  defaultValue?: UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
  control?: TControl;
}): UnpackNestedValue<DeepPartial<TWatchFieldValues>>;
export function useWatch<
  TWatchFieldValues,
  TControl extends Control = Control
>({
  control,
  name,
  defaultValue,
}: UseWatchOptions<TControl>): TWatchFieldValues {
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
