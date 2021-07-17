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
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
  control?: Control<TFieldValues>;
}): FieldPathValue<TFieldValues, TFieldName>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldNames extends FieldPath<TFieldValues>[] = FieldPath<TFieldValues>[],
>(props: {
  name: readonly [...TFieldNames];
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
}): FieldPathValues<TFieldValues, TFieldNames>;
export function useWatch<TFieldValues>(props?: UseWatchProps<TFieldValues>) {
  const { control, name, defaultValue } = props || {};
  const methods = useFormContext();
  const _name = React.useRef(name);
  _name.current = name;

  const { getWatch, _subjects } = control || methods.control;
  const [value, updateValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? getWatch(name as InternalFieldName)
      : defaultValue,
  );

  React.useEffect(() => {
    getWatch(name as InternalFieldName);

    const watchSubscription = _subjects.current.watch.subscribe({
      next: ({ name }) =>
        (!_name.current ||
          !name ||
          convertToArrayPayload(_name.current).some(
            (fieldName) =>
              name &&
              fieldName &&
              (fieldName.startsWith(name as InternalFieldName) ||
                name.startsWith(fieldName as InternalFieldName)),
          )) &&
        updateValue(
          getWatch(
            _name.current as InternalFieldName,
            defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
          ),
        ),
    });

    return () => watchSubscription.unsubscribe();
  }, []);

  return value;
}
