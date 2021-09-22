import * as React from 'react';

import convertToArrayPayload from './utils/convertToArrayPayload';
import isObject from './utils/isObject';
import isUndefined from './utils/isUndefined';
import { TearDown } from './utils/Subject';
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
  const _watchSubscription = React.useRef<{
    unsubscribe: TearDown;
  }>();
  const _name = React.useRef(name);
  _name.current = name;
  _watchSubscription.current =
    _watchSubscription.current ||
    control._subjects.watch.subscribe({
      next: ({ name }) => {
        if (
          !_name.current ||
          !name ||
          convertToArrayPayload(_name.current).some(
            (fieldName) =>
              name &&
              fieldName &&
              (fieldName.startsWith(name as InternalFieldName) ||
                name.startsWith(fieldName as InternalFieldName)),
          )
        ) {
          const result = control._getWatch(
            _name.current as InternalFieldName,
            defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
            true,
          );
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
    disabled && _watchSubscription.current!.unsubscribe();
    return () => _watchSubscription.current!.unsubscribe();
  }, [disabled, control, defaultValue]);

  React.useEffect(() => {
    control._removeFields();
  });

  return value;
}
