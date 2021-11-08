import * as React from 'react';

import { generateWatchOutput } from './logic/generateWatchOutput';
import shouldSubscribeByName from './logic/shouldSubscribeByName';
import isObject from './utils/isObject';
import isString from './utils/isString';
import isUndefined from './utils/isUndefined';
import {
  Control,
  DeepPartialSkipArrayKey,
  FieldPath,
  FieldPathValue,
  FieldPathValues,
  FieldValues,
  UnpackNestedValue,
  UseWatchProps,
} from './types';
import { useFormContext } from './useFormContext';
import { useSubscribe } from './useSubscribe';
import { get } from './utils';

export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
>(props: {
  defaultValue?: UnpackNestedValue<DeepPartialSkipArrayKey<TFieldValues>>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
}): UnpackNestedValue<DeepPartialSkipArrayKey<TFieldValues>>;
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
  name: [...TFieldNames];
  defaultValue?: UnpackNestedValue<DeepPartialSkipArrayKey<TFieldValues>>;
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
  const _name = React.useRef(name);

  _name.current = name;

  useSubscribe({
    disabled,
    subject: control._subjects.watch,
    callback: (formState) => {
      if (shouldSubscribeByName(_name.current, formState.name)) {
        const fieldValues = generateWatchOutput(
          _name.current,
          control._names,
          control._formValues,
        );

        updateValue(
          isObject(fieldValues) &&
            !(
              isString(_name.current) &&
              get(control._fields, _name.current, {})._f
            )
            ? { ...fieldValues }
            : Array.isArray(fieldValues)
            ? [...fieldValues]
            : fieldValues,
        );
      }
    },
  });

  const [value, updateValue] = React.useState<unknown>(
    isUndefined(defaultValue) ? control._getWatch(name) : defaultValue,
  );

  React.useEffect(() => {
    control._removeUnmounted();
  });

  return value;
}
