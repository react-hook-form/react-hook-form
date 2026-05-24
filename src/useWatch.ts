import React from 'react';

import generateWatchOutput from './logic/generateWatchOutput';
import deepEqual from './utils/deepEqual';
import type {
  Control,
  DeepPartialSkipArrayKey,
  FieldPath,
  FieldPathValue,
  FieldPathValues,
  FieldValues,
  InternalFieldName,
  UseWatchProps,
} from './types';
import { useFormControlContext } from './useFormControlContext';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/** Watches the entire form; re-renders when any value changes. */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues = TFieldValues,
>(props: {
  name?: undefined;
  defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
  control?: Control<TFieldValues, any, TTransformedValues>;
  disabled?: boolean;
  exact?: boolean;
  compute?: undefined;
}): DeepPartialSkipArrayKey<TFieldValues>;
/** Watches a single field by name. */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: {
  name: TFieldName;
  defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
  control?: Control<TFieldValues, any, TTransformedValues>;
  disabled?: boolean;
  exact?: boolean;
  compute?: undefined;
}): FieldPathValue<TFieldValues, TFieldName>;
/** Watches the entire form and derives a value via `compute`. */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues = TFieldValues,
  TComputeValue = unknown,
>(props: {
  name?: undefined;
  defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
  control?: Control<TFieldValues, any, TTransformedValues>;
  disabled?: boolean;
  exact?: boolean;
  compute: (formValues: TFieldValues) => TComputeValue;
}): TComputeValue;
/** Watches a single field and derives a value via `compute`. */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
  TComputeValue = unknown,
>(props: {
  name: TFieldName;
  defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
  control?: Control<TFieldValues, any, TTransformedValues>;
  disabled?: boolean;
  exact?: boolean;
  compute: (
    fieldValue: FieldPathValue<TFieldValues, TFieldName>,
  ) => TComputeValue;
}): TComputeValue;
/** Watches multiple fields by name array. */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldNames extends readonly FieldPath<TFieldValues>[] =
    readonly FieldPath<TFieldValues>[],
  TTransformedValues = TFieldValues,
>(props: {
  name: readonly [...TFieldNames];
  defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
  control?: Control<TFieldValues, any, TTransformedValues>;
  disabled?: boolean;
  exact?: boolean;
  compute?: undefined;
}): FieldPathValues<TFieldValues, TFieldNames>;
/** Watches multiple fields and derives a value via `compute`. */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldNames extends readonly FieldPath<TFieldValues>[] =
    readonly FieldPath<TFieldValues>[],
  TTransformedValues = TFieldValues,
  TComputeValue = unknown,
>(props: {
  name: readonly [...TFieldNames];
  defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
  control?: Control<TFieldValues, any, TTransformedValues>;
  disabled?: boolean;
  exact?: boolean;
  compute: (
    fieldValue: FieldPathValues<TFieldValues, TFieldNames>,
  ) => TComputeValue;
}): TComputeValue;
/** Watches the entire form; reads `control` from `FormProvider` context. */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
>(): DeepPartialSkipArrayKey<TFieldValues>;
/**
 * Subscribes to field value changes and isolates re-renders to the hook level.
 *
 * @see [API](https://react-hook-form.com/docs/usewatch)
 *
 * @example
 * ```tsx
 * const email = useWatch({ control, name: "email" });
 * const all   = useWatch({ control });
 * const adult = useWatch({ control, name: "age", compute: (v) => v >= 18 });
 * ```
 */
export function useWatch<TFieldValues extends FieldValues>(
  props?: UseWatchProps<TFieldValues>,
) {
  const formControl = useFormControlContext<TFieldValues>();
  const {
    control = formControl,
    name,
    defaultValue,
    disabled,
    exact,
    compute,
  } = props || {};
  const _defaultValue = React.useRef(defaultValue);
  const _compute = React.useRef(compute);
  const _computeFormValues = React.useRef<undefined | unknown>(undefined);

  const _prevControl = React.useRef(control);
  const _prevName = React.useRef(name);

  _compute.current = compute;

  const [value, updateValue] = React.useState(() => {
    const defaultValue = control._getWatch(
      name as InternalFieldName,
      _defaultValue.current as DeepPartialSkipArrayKey<TFieldValues>,
    );

    return _compute.current ? _compute.current(defaultValue) : defaultValue;
  });

  const getCurrentOutput = React.useCallback(
    (values?: TFieldValues) => {
      const formValues = generateWatchOutput(
        name as InternalFieldName | InternalFieldName[],
        control._names,
        values || control._formValues,
        false,
        _defaultValue.current,
      );

      return _compute.current ? _compute.current(formValues) : formValues;
    },
    [control._formValues, control._names, name],
  );

  const refreshValue = React.useCallback(
    (values?: TFieldValues) => {
      if (!disabled) {
        const formValues = generateWatchOutput(
          name as InternalFieldName | InternalFieldName[],
          control._names,
          values || control._formValues,
          false,
          _defaultValue.current,
        );

        if (_compute.current) {
          const computedFormValues = _compute.current(formValues);

          if (!deepEqual(computedFormValues, _computeFormValues.current)) {
            updateValue(computedFormValues);
            _computeFormValues.current = computedFormValues;
          }
        } else {
          updateValue(formValues);
        }
      }
    },
    [control._formValues, control._names, disabled, name],
  );

  useIsomorphicLayoutEffect(() => {
    if (
      _prevControl.current !== control ||
      !deepEqual(_prevName.current, name)
    ) {
      _prevControl.current = control;
      _prevName.current = name;
      refreshValue();
    }

    return control._subscribe({
      name,
      formState: {
        values: true,
      },
      exact,
      callback: (formState) => {
        refreshValue(formState.values);
      },
    });
  }, [control, exact, name, refreshValue]);

  React.useEffect(() => control._removeUnmounted());

  // If name or control changed for this render, synchronously reflect the
  // latest value so callers (like useController) see the correct value
  // immediately on the same render.

  // Optimize: Check control reference first before expensive deepEqual
  const controlChanged = _prevControl.current !== control;
  const prevName = _prevName.current;

  // Cache the computed output to avoid duplicate calls within the same render
  // We include shouldReturnImmediate in deps to ensure proper recomputation
  const computedOutput = React.useMemo(() => {
    if (disabled) {
      return null;
    }

    const nameChanged = !controlChanged && !deepEqual(prevName, name);
    const shouldReturnImmediate = controlChanged || nameChanged;

    return shouldReturnImmediate ? getCurrentOutput() : null;
  }, [disabled, controlChanged, name, prevName, getCurrentOutput]);

  return computedOutput !== null ? computedOutput : value;
}
