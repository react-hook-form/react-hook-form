import * as React from 'react';

import convertToArrayPayload from './utils/convertToArrayPayload';
import isObject from './utils/isObject';
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
import { useSubscribe } from './useSubscribe';

export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
>(props: {
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
}): UnpackNestedValue<DeepPartial<TFieldValues>>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
}): FieldPathValue<TFieldValues, TFieldName>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldNames extends FieldPath<TFieldValues>[] = FieldPath<TFieldValues>[],
>(props: {
  name: readonly [...TFieldNames];
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
}): FieldPathValues<TFieldValues, TFieldNames>;
export function useWatch<TFieldValues>(props?: UseWatchProps<TFieldValues>) {
  const methods = useFormContext();
  const {
    control = methods.control,
    name,
    defaultValue,
    disabled,
  } = props || {};

  useSubscribe({
    disabled,
    subject: control._subjects.watch,
    callback: ({ name: fieldName }) => {
      if (
        !name ||
        !fieldName ||
        convertToArrayPayload(name).some(
          (currentName) =>
            fieldName &&
            currentName &&
            (fieldName.startsWith(currentName as InternalFieldName) ||
              currentName.startsWith(fieldName as InternalFieldName)),
        )
      ) {
        const result = control._getWatch(
          name as InternalFieldName,
          defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
          true,
        );

        !isUndefined(result) &&
          updateValue(
            isObject(result)
              ? { ...result }
              : Array.isArray(result)
              ? [...result]
              : result,
          );
      }
    },
  });

  const [value, updateValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? control._getWatch(name as InternalFieldName)
      : defaultValue,
  );

  React.useEffect(() => {
    control._removeFields();
  });

  return value;
}
