import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import generateId from './logic/generateId';
import {
  UseWatchOptions,
  FieldValuesFromControl,
  UnpackNestedValue,
  FieldName,
  Control,
  DeepPartial,
  EmptyObject,
  LiteralToPrimitive,
} from './types';

export function useWatch<
  TWatchValues extends FieldValuesFromControl<TControl>,
  TControl extends Control = Control
>(props: { control?: TControl }): EmptyObject | UnpackNestedValue<TWatchValues>;
export function useWatch<
  TWatchValues extends FieldValuesFromControl<TControl>,
  TControl extends Control = Control
>(props: {
  defaultValue: UnpackNestedValue<DeepPartial<TWatchValues>>;
  control?: TControl;
}): UnpackNestedValue<TWatchValues>;
export function useWatch<
  TWatchValue extends unknown,
  TFieldName extends FieldName<FieldValuesFromControl<TControl>>,
  TControl extends Control = Control
>(props: {
  name: TFieldName;
  control?: TControl;
}):
  | undefined
  | (TFieldName extends keyof FieldValuesFromControl<TControl>
      ? UnpackNestedValue<FieldValuesFromControl<TControl>>[TFieldName]
      : LiteralToPrimitive<TWatchValue>);
export function useWatch<
  TWatchValue extends unknown,
  TFieldName extends FieldName<FieldValuesFromControl<TControl>>,
  TControl extends Control = Control
>(props: {
  name: TFieldName;
  defaultValue: TFieldName extends keyof FieldValuesFromControl<TControl>
    ? UnpackNestedValue<FieldValuesFromControl<TControl>>[TFieldName]
    : LiteralToPrimitive<TWatchValue>;
  control?: TControl;
}): TFieldName extends keyof FieldValuesFromControl<TControl>
  ? UnpackNestedValue<FieldValuesFromControl<TControl>>[TFieldName]
  : LiteralToPrimitive<TWatchValue>;
export function useWatch<
  TWatchValues extends FieldValuesFromControl<TControl>,
  TFieldName extends keyof TWatchValues,
  TControl extends Control = Control
>(props: {
  name: TFieldName[];
  control?: TControl;
}): EmptyObject | UnpackNestedValue<Pick<TWatchValues, TFieldName>>;
export function useWatch<
  TWatchValues extends FieldValuesFromControl<TControl>,
  TFieldName extends keyof TWatchValues,
  TControl extends Control = Control
>(props: {
  name: TFieldName[];
  defaultValue: UnpackNestedValue<DeepPartial<TWatchValues>>;
  control?: TControl;
}): UnpackNestedValue<Pick<TWatchValues, TFieldName>>;
export function useWatch<
  TWatchValues extends FieldValuesFromControl<TControl>,
  TControl extends Control = Control
>(props: {
  name: string[];
  control?: TControl;
}): EmptyObject | UnpackNestedValue<DeepPartial<TWatchValues>>;
export function useWatch<
  TWatchValues extends FieldValuesFromControl<TControl>,
  TControl extends Control = Control
>(props: {
  name: string[];
  defaultValue: UnpackNestedValue<DeepPartial<TWatchValues>>;
  control?: TControl;
}): UnpackNestedValue<DeepPartial<TWatchValues>>;
export function useWatch<TWatchValues, TControl extends Control = Control>({
  control,
  name,
  defaultValue,
}: UseWatchOptions<TControl>): TWatchValues {
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

  return (isUndefined(value) ? defaultValue : value) as TWatchValues;
}
