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
  const [value, updateValue] = React.useState<unknown>(defaultValue);

  React.useEffect(() => {
    watchSubjectRef.current.subscribe({
      next: ({ inputName, inputValue }) => {
        if (isString(name) && inputName === inputName) {
          updateValue(
            isUndefined(inputValue)
              ? get(defaultValuesRef.current, name, defaultValue)
              : inputValue,
          );
        } else {
          const result = watchInternal(name, defaultValuesRef.current);

          updateValue(
            isUndefined(result)
              ? Array.isArray(name)
                ? name.reduce(
                    (previous, inputName) => ({
                      ...previous,
                      [inputName]: get(defaultValuesRef.current, inputName),
                    }),
                    {},
                  )
                : defaultValuesRef.current
              : result,
          );
        }
      },
    });
  }, []);

  return value as TWatchFieldValues;
}
