import * as React from 'react';

import isString from './utils/isString';
import isUndefined from './utils/isUndefined';
import {
  Control,
  DeepPartial,
  FieldPath,
  FieldPathValue,
  FieldPathValues,
  FieldValues,
  InternalFieldName,
  UnpackNestedValue,
  UseWatchProps,
} from './types';
import { useFormContext } from './useFormContext';

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
export function useWatch<TFieldValues>(props?: UseWatchProps<TFieldValues>) {
  const { control, name, defaultValue } = props || {};
  const methods = useFormContext();

  const { watchInternal, watchSubjectRef } = control || methods.control;
  const [value, updateValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? watchInternal(name as InternalFieldName)
      : defaultValue,
  );

  React.useEffect(() => {
    watchInternal(name as InternalFieldName);

    const watchSubscription = watchSubjectRef.current.subscribe({
      next: ({ name: inputName, value }) => {
        (!name ||
          !inputName ||
          (Array.isArray(name) ? name : [name]).some(
            (fieldName) =>
              inputName &&
              fieldName &&
              inputName.startsWith(fieldName as InternalFieldName),
          )) &&
          updateValue(
            isString(inputName) && name === inputName && !isUndefined(value)
              ? value
              : watchInternal(
                  name as string,
                  defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
                ),
          );
      },
    });

    return () => watchSubscription.unsubscribe();
  }, [name]);

  return value;
}
