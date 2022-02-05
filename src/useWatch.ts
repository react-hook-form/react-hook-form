import React from 'react';

import generateWatchOutput from './logic/generateWatchOutput';
import shouldSubscribeByName from './logic/shouldSubscribeByName';
import isObject from './utils/isObject';
import isUndefined from './utils/isUndefined';
import objectHasFunction from './utils/objectHasFunction';
import {
  Auto,
  Control,
  DeepPartialSkipArrayKey,
  FieldPathValue,
  FieldPathValues,
  FieldValues,
  InternalFieldName,
  PathString,
  UnpackNestedValue,
  UseWatchProps,
} from './types';
import { useFormContext } from './useFormContext';
import { useSubscribe } from './useSubscribe';

/**
 * Custom hook to subscribe to field change and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/api/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @param props - defaultValue, disable subscription and match exact name.
 *
 * @example
 * ```tsx
 * const { watch } = useForm();
 * const values = useWatch({
 *   control,
 *   name: "fieldA",
 *   defaultValue: "default value",
 *   exact: false,
 * })
 * ```
 */
export function useWatch<
  TFieldValues extends FieldValues,
  TFieldName extends PathString,
>(props: {
  name: Auto.FieldPath<TFieldValues, TFieldName>;
  defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
  exact?: boolean;
}): FieldPathValue<TFieldValues, TFieldName>;
/**
 * Custom hook to subscribe to field change and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/api/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @param props - defaultValue, disable subscription and match exact name.
 *
 * @example
 * ```tsx
 * const { watch } = useForm();
 * const values = useWatch({
 *   control,
 *   name: ["fieldA", "fieldB"],
 *   defaultValue: {
 *     fieldA: "data",
 *     fieldB: "data"
 *   },
 *   exact: false,
 * })
 * ```
 */
export function useWatch<
  TFieldValues extends FieldValues,
  TFieldNames extends readonly PathString[],
>(props: {
  name: readonly [...Auto.FieldPaths<TFieldValues, TFieldNames>];
  defaultValue?: UnpackNestedValue<DeepPartialSkipArrayKey<TFieldValues>>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
  exact?: boolean;
}): FieldPathValues<TFieldValues, TFieldNames>;
/**
 * Subscribe to the entire form values change and re-render at the hook level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/api/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @param props - defaultValue, disable subscription and match exact name.
 *
 * @example
 * ```tsx
 * const { watch } = useForm();
 * const values = useWatch({
 *   control,
 *   defaultValue: {
 *     name: "data"
 *   },
 *   exact: false,
 * })
 * ```
 */
export function useWatch<TFieldValues extends FieldValues>(props: {
  defaultValue?: UnpackNestedValue<DeepPartialSkipArrayKey<TFieldValues>>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
  exact?: boolean;
}): UnpackNestedValue<DeepPartialSkipArrayKey<TFieldValues>>;
/**
 * Custom hook to subscribe to field change and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/api/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @example
 * ```tsx
 * // can skip passing down the control into useWatch if the form is wrapped with the FormProvider
 * const values = useWatch()
 * ```
 */
export function useWatch<
  TFieldValues extends FieldValues,
  TFieldName extends PathString,
>(props?: UseWatchProps<TFieldValues, TFieldName>) {
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

  const callback = React.useCallback(
    (formState) => {
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
            : isUndefined(fieldValues)
            ? defaultValue
            : fieldValues,
        );
      }
    },
    [control, exact, defaultValue],
  );

  useSubscribe({
    disabled,
    subject: control._subjects.watch,
    callback,
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
