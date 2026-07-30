import React from 'react';

import generateWatchOutput from './logic/generateWatchOutput';
import cloneObject from './utils/cloneObject';
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

/**
 * Subscribes to all form value changes and re-renders at the hook level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @param props - DefaultValue, disabled subscription, and exact name matching.
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   control,
 *   defaultValue: {
 *     name: "data"
 *   },
 *   exact: false,
 * })
 * ```
 */
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
/**
 * Custom hook to subscribe to field changes and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @param props - DefaultValue, disabled subscription, and exact name matching.
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   control,
 *   name: "fieldA",
 *   defaultValue: "default value",
 *   exact: false,
 * })
 * ```
 */
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
/**
 * Custom hook to subscribe to field changes and use a compute function to produce state updates.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch)
 *
 * @param props - DefaultValue, disabled subscription, and exact name matching.
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   control,
 *   compute: (formValues) => formValues.fieldA
 * })
 * ```
 */
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
/**
 * Custom hook to subscribe to field changes and use a compute function to produce state updates.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch)
 *
 * @param props - DefaultValue, disabled subscription, and exact name matching.
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   control,
 *   name: "fieldA",
 *   defaultValue: "default value",
 *   exact: false,
 *   compute: (fieldValue) => fieldValue === "data" ? fieldValue : null,
 * })
 * ```
 */
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
/**
 * Custom hook to subscribe to field changes and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @param props - DefaultValue, disabled subscription, and exact name matching.
 *
 * @example
 * ```tsx
 * const { control } = useForm();
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
/**
 * Custom hook to subscribe to field changes and use a compute function to produce state updates.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch)
 *
 * @param props - DefaultValue, disabled subscription, and exact name matching.
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   control,
 *   name: ["fieldA", "fieldB"],
 *   defaultValue: {
 *     fieldA: "data",
 *     fieldB: 0
 *   },
 *   compute: ([fieldAValue, fieldBValue]) => fieldB === 2 ? fieldA : null,
 *   exact: false,
 * })
 * ```
 */
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
/**
 * Custom hook to subscribe to field changes and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @example
 * ```tsx
 * // Can skip passing down the control into useWatch if the form is wrapped with FormProvider
 * const values = useWatch()
 * ```
 */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
>(): DeepPartialSkipArrayKey<TFieldValues>;
/**
 * Custom hook to subscribe to field changes and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   name: "fieldName",
 *   control,
 * })
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
  const _currentFormOutput = React.useRef<unknown>(undefined);
  const _effectFormOutput = React.useRef<unknown>(undefined);
  const _effectInitialized = React.useRef(false);

  const _prevControl = React.useRef(control);
  const _prevCompute = React.useRef(compute);
  const _prevName = React.useRef(name);

  _compute.current = compute;

  const [value, updateValue] = React.useState(() => {
    const defaultValue = control._getWatch(
      name as InternalFieldName,
      _defaultValue.current as DeepPartialSkipArrayKey<TFieldValues>,
    );

    _currentFormOutput.current = defaultValue;

    return _compute.current ? _compute.current(defaultValue) : defaultValue;
  });
  const _currentOutput = React.useRef(value);

  _currentOutput.current = value;

  const getCurrentFormOutput = React.useCallback(
    (values?: TFieldValues) => {
      return generateWatchOutput(
        name as InternalFieldName | InternalFieldName[],
        control._names,
        values || control._formValues,
        false,
        _defaultValue.current,
      );
    },
    // Read mutable control state when invoked without reconnecting on reset.
    [control, name],
  );

  const getCurrentOutput = React.useCallback(
    (values?: TFieldValues) => {
      const formValues = getCurrentFormOutput(values);

      return _compute.current ? _compute.current(formValues) : formValues;
    },
    [getCurrentFormOutput],
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

        _currentFormOutput.current = formValues;

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
    [control, disabled, name],
  );

  const refreshValueOnEffect = React.useCallback(() => {
    if (!disabled) {
      const currentFormOutput = getCurrentFormOutput();

      // A mounted control on first setup may have updated while Activity was hidden.
      const formOutputChanged =
        _prevControl.current !== control ||
        !deepEqual(_prevName.current, name) ||
        (!_effectInitialized.current
          ? control._state.mount
          : !deepEqual(_effectFormOutput.current, currentFormOutput));
      const computeChanged = _prevCompute.current !== _compute.current;
      const shouldReconcile = formOutputChanged || computeChanged;

      // Reapply changed compute callbacks to the form output behind local state.
      const reconciledFormOutput = formOutputChanged
        ? currentFormOutput
        : _currentFormOutput.current;
      const currentOutput = _compute.current
        ? _compute.current(reconciledFormOutput as TFieldValues)
        : reconciledFormOutput;

      // Keep compute's comparison snapshot aligned with reconciled form data.
      if (_compute.current) {
        _computeFormValues.current = shouldReconcile
          ? currentOutput
          : _currentOutput.current;
      }

      _currentFormOutput.current = reconciledFormOutput;
      _effectInitialized.current = true;

      if (
        !shouldReconcile ||
        deepEqual(_currentOutput.current, currentOutput)
      ) {
        return;
      }

      _currentOutput.current = currentOutput;
      updateValue((previousOutput: unknown) =>
        deepEqual(previousOutput, currentOutput)
          ? previousOutput
          : currentOutput,
      );
    }
  }, [control, disabled, getCurrentFormOutput, name]);

  useIsomorphicLayoutEffect(() => {
    const unsubscribe = control._subscribe({
      name,
      formState: {
        values: true,
      },
      exact,
      callback: (formState) => {
        refreshValue(formState.values);
      },
    });

    // Activity and Strict Mode can reconnect Effects while preserving hook state.
    refreshValueOnEffect();

    _prevControl.current = control;
    _prevName.current = name;

    if (!disabled) {
      // Disabled subscriptions defer compute reconciliation until re-enabled.
      _prevCompute.current = _compute.current;
    }

    return () => {
      unsubscribe();

      if (!disabled) {
        // Snapshot connected data before cleanup to detect in-place updates.
        _effectFormOutput.current = cloneObject(getCurrentFormOutput());
      }
    };
  }, [
    control,
    disabled,
    exact,
    getCurrentFormOutput,
    name,
    refreshValue,
    refreshValueOnEffect,
  ]);

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
