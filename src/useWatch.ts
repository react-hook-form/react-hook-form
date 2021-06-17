import * as React from 'react';

import convertToArrayPayload from './utils/convertToArrayPayload';
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
  TFieldValues extends FieldValues = FieldValues,
>(props: {
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
}): UnpackNestedValue<DeepPartial<TFieldValues>>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TName;
  defaultValue?: FieldPathValue<TFieldValues, TName>;
  control?: Control<TFieldValues>;
}): FieldPathValue<TFieldValues, TName>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues>[] = FieldPath<TFieldValues>[],
>(props: {
  name: TName;
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
}): FieldPathValues<TFieldValues, TName>;
export function useWatch<TFieldValues>(props?: UseWatchProps<TFieldValues>) {
  const methods = useFormContext();
  const { control = methods.control, name, defaultValue } = props || {};
  const nameRef = React.useRef(name);
  nameRef.current = name;

  const [value, updateValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? control.watchInternal(name as InternalFieldName)
      : defaultValue,
  );

  React.useEffect(() => {
    control.watchInternal(name as InternalFieldName);

    const watchSubscription = control.subjectsRef.watch.subscribe({
      next: ({ name: inputName, values }) =>
        (!nameRef.current ||
          !inputName ||
          convertToArrayPayload(nameRef.current).some(
            (fieldName) =>
              inputName &&
              fieldName &&
              (fieldName.startsWith(inputName as InternalFieldName) ||
                inputName.startsWith(fieldName as InternalFieldName)),
          )) &&
        updateValue(
          control.watchInternal(
            nameRef.current as string,
            defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
            false,
            values,
          ),
        ),
    });

    return () => watchSubscription.unsubscribe();
  }, []);

  return value;
}
