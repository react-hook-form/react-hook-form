import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import get from './utils/get';
import {
  DeepPartial,
  UseWatchProps,
  FieldValues,
  UnpackNestedValue,
  Control,
  FieldPath,
} from './types';

export function useWatch<
  TFieldValues extends FieldValues = FieldValues
>(props: {
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
}): UnpackNestedValue<DeepPartial<TFieldValues>>;
export function useWatch<
  TFieldValues extends FieldValues,
  TWatchFieldValue extends any
>(props: {
  name: FieldPath<TFieldValues>;
  defaultValue?: UnpackNestedValue<TWatchFieldValue>;
  control?: Control<TFieldValues>;
}): UnpackNestedValue<TWatchFieldValue>;
export function useWatch<TFieldValues extends FieldValues>(props: {
  name: FieldPath<TFieldValues>[];
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
}): UnpackNestedValue<DeepPartial<TFieldValues>>;
export function useWatch<TFieldValues>({
  control,
  name,
  defaultValue,
}: UseWatchProps<TFieldValues>): unknown {
  const methods = useFormContext();

  if (process.env.NODE_ENV !== 'production') {
    if (!control && !methods) {
      throw new Error(
        '📋 useWatch is missing `control` prop. https://react-hook-form.com/api#useWatch',
      );
    }
  }

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
    if (process.env.NODE_ENV !== 'production') {
      if (name === '') {
        console.warn(
          '📋 useWatch `name` attribute can not be empty string. https://react-hook-form.com/api#useWatch',
        );
      }
    }

    const tearDown = watchSubjectRef.current.subscribe({
      next: ({ name: inputName, value }) => {
        updateValue(
          isString(name) && name === inputName && !isUndefined(value)
            ? value
            : watchInternal(name as string, defaultValue),
        );
      },
    });

    return () => tearDown.unsubscribe();
  }, [name]);

  return value;
}
