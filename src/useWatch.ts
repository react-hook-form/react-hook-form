import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import get from './utils/get';
import isObject from './utils/isObject';
import {
  DeepPartial,
  UseWatchProps,
  FieldValues,
  UnpackNestedValue,
  Control,
  FieldPath,
  InternalFieldName,
  FieldPathValue,
  FieldPathValues,
} from './types';

export function useWatch<
  TFieldValues extends FieldValues = FieldValues
>(props: {
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
}): UnpackNestedValue<DeepPartial<TFieldValues>>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: {
  name: TName;
  defaultValue?: FieldPathValue<TFieldValues, TName>;
  control?: Control<TFieldValues>;
}): FieldPathValue<TFieldValues, TName>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues>[] = FieldPath<TFieldValues>[]
>(props: {
  name: TName;
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
}): FieldPathValues<TFieldValues, TName>;
export function useWatch<TFieldValues>({
  control,
  name,
  defaultValue,
}: UseWatchProps<TFieldValues>) {
  const methods = useFormContext();

  const { watchInternal, defaultValuesRef, watchSubjectRef } =
    control || methods.control;
  const [value, updateValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? Array.isArray(name)
        ? name.reduce(
            (previous, inputName) => ({
              ...previous,
              [inputName]: get(defaultValuesRef.current, inputName as string),
            }),
            {},
          )
        : isString(name)
        ? get(defaultValuesRef.current, name)
        : defaultValuesRef.current
      : defaultValue,
  );

  React.useEffect(() => {
    const watchSubscription = watchSubjectRef.current.subscribe({
      next: ({ name: inputName, value }) => {
        updateValue(
          isString(inputName) && name === inputName && !isUndefined(value)
            ? value
            : name && isObject(value)
            ? get(value, name as InternalFieldName, defaultValue)
            : watchInternal(name as string, defaultValue),
        );
      },
    });

    return () => watchSubscription.unsubscribe();
  }, [name]);

  return value;
}
