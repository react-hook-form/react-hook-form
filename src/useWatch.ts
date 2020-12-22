import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
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

  const { watchInternal, defaultValuesRef, watchSubjectRef } =
    control || methods.control;
  const [value, updateValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? Array.isArray(name)
        ? name.reduce(
            (previous, inputName) => ({
              ...previous,
              [inputName]: get(defaultValuesRef.current, inputName),
            }),
            {},
          )
        : isString(name)
        ? get(defaultValuesRef.current, name)
        : defaultValuesRef.current
      : defaultValue,
  );

  React.useEffect(() => {
    const tearDown = watchSubjectRef.current.subscribe({
      next: ({ inputName, inputValue }) => {
        updateValue(
          isString(name) && !isUndefined(inputName)
            ? name === inputName
              ? isUndefined(inputValue)
                ? watchInternal(name, defaultValuesRef.current)
                : inputValue
              : inputValue
            : watchInternal(name, defaultValuesRef.current),
        );
      },
    });

    return () => {
      tearDown.unsubscribe();
    };
  }, []);

  return value as TWatchFieldValues;
}
