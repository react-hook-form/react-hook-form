import * as React from 'react';

import generateWatchOutput from './logic/generateWatchOutput';
import shouldSubscribeByName from './logic/shouldSubscribeByName';
import isObject from './utils/isObject';
import isUndefined from './utils/isUndefined';
import objectHasFunction from './utils/objectHasFunction';
import {
  Control,
  DeepPartialSkipArrayKey,
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
  defaultValue?: UnpackNestedValue<DeepPartialSkipArrayKey<TFieldValues>>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
  exact?: boolean;
}): UnpackNestedValue<DeepPartialSkipArrayKey<TFieldValues>>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
  exact?: boolean;
}): FieldPathValue<TFieldValues, TFieldName>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldNames extends readonly FieldPath<TFieldValues>[] = readonly FieldPath<TFieldValues>[],
>(props: {
  name: readonly [...TFieldNames];
  defaultValue?: UnpackNestedValue<DeepPartialSkipArrayKey<TFieldValues>>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
  exact?: boolean;
}): FieldPathValues<TFieldValues, TFieldNames>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldNames extends FieldPath<TFieldValues>[] = FieldPath<TFieldValues>[],
>(): FieldPathValues<TFieldValues, TFieldNames>;
export function useWatch<TFieldValues>(props?: UseWatchProps<TFieldValues>) {
  const methods = useFormContext();
  const {
    control = methods.control,
    name,
    defaultValue,
    disabled,
    exact,
  } = props || {};
  const _name = React.useRef(name);

  _name.current = name;

  useSubscribe({
    disabled,
    subject: control._subjects.watch,
    callback: (formState) => {
      if (
        shouldSubscribeByName(
          _name.current as InternalFieldName,
          formState.name,
          exact,
        )
      ) {
        const fieldValues = generateWatchOutput(
          _name.current as InternalFieldName | InternalFieldName[],
          control._names,
          formState.values || control._formValues,
        );

        updateValue(
          isUndefined(_name.current) ||
            (isObject(fieldValues) && !objectHasFunction(fieldValues))
            ? { ...fieldValues }
            : Array.isArray(fieldValues)
            ? [...fieldValues]
            : fieldValues,
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
    control._removeUnmounted();
  });

  return value;
}
