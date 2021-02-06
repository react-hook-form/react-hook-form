import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import get from './utils/get';
import isObject from './utils/isObject';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
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
  control?: Control<TFieldValues>;
}): FieldPathValue<TFieldValues, TName>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues>[] = FieldPath<TFieldValues>[]
>(props: {
  name: TName;
  control?: Control<TFieldValues>;
}): FieldPathValues<TFieldValues, TName>;
export function useWatch<TFieldValues>({
  control,
  name,
}: UseWatchProps<TFieldValues>) {
  const methods = useFormContext();

  const { watchInternal, defaultValuesRef, watchSubjectRef, fieldsRef } =
    control || methods.control;
  const [value, updateValue] = React.useState<unknown>(
    Array.isArray(name)
      ? name.map((inputName) =>
          getFieldValue(get(fieldsRef.current, inputName as InternalFieldName)),
        )
      : isString(name)
      ? getFieldValue(get(fieldsRef.current, name as InternalFieldName))
      : getFieldsValues(fieldsRef, defaultValuesRef),
  );

  React.useEffect(() => {
    const watchSubscription = watchSubjectRef.current.subscribe({
      next: ({ name: inputName, value }) => {
        updateValue(
          isString(inputName) && name === inputName && !isUndefined(value)
            ? value
            : name && isObject(value)
            ? get(value, name as InternalFieldName)
            : watchInternal(name as string),
        );
      },
    });

    return () => watchSubscription.unsubscribe();
  }, [name]);

  return value;
}
