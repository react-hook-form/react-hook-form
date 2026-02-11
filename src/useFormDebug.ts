import React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import type {
  Control,
  FieldValues,
  FormState,
  InternalFieldName,
} from './types';
import { useFormControlContext } from './useFormControlContext';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * Props for the useFormDebug hook.
 */
export type UseFormDebugProps<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues = TFieldValues,
> = {
  /**
   * Control object from useForm.
   */
  control?: Control<TFieldValues, any, TTransformedValues>;
};

/**
 * Return type for the useFormDebug hook.
 */
export type UseFormDebugReturn<TFieldValues extends FieldValues = FieldValues> =
  {
    /**
     * Complete form state including all properties.
     */
    formState: FormState<TFieldValues>;
    /**
     * Current form values.
     */
    values: TFieldValues;
    /**
     * Set of registered field names.
     */
    registeredFields: string[];
    /**
     * Set of field array names.
     */
    fieldArrays: string[];
    /**
     * Number of times this hook has been rendered.
     */
    renderCount: number;
  };

/**
 * A development-focused hook that provides enhanced visibility into form state for debugging.
 * This hook subscribes to ALL form state changes and returns comprehensive debugging information.
 *
 * @remarks
 * This hook is intended for development and debugging purposes.
 * It subscribes to all form state properties which may impact performance.
 *
 * [API](https://react-hook-form.com/docs/useformdebug)
 *
 * @param props - useFormDebug props
 *
 * @returns debug information including formState, values, registered fields, and render count
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, control } = useForm();
 *   const debug = useFormDebug({ control });
 *
 *   console.log('Form Debug:', debug);
 *
 *   return (
 *     <form>
 *       <input {...register('name')} />
 *       <pre>{JSON.stringify(debug, null, 2)}</pre>
 *     </form>
 *   );
 * }
 * ```
 */
export function useFormDebug<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues = TFieldValues,
>(
  props?: UseFormDebugProps<TFieldValues, TTransformedValues>,
): UseFormDebugReturn<TFieldValues> {
  const formControl = useFormControlContext<
    TFieldValues,
    any,
    TTransformedValues
  >();
  const { control = formControl } = props || {};

  const [formState, updateFormState] = React.useState(control._formState);
  const [values, setValues] = React.useState<TFieldValues>(
    control._formValues as TFieldValues,
  );
  const renderCount = React.useRef(0);

  // Track all form state properties
  const _localProxyFormState = React.useRef({
    isDirty: true,
    isLoading: true,
    dirtyFields: true,
    touchedFields: true,
    validatingFields: true,
    isValidating: true,
    isValid: true,
    errors: true,
  });

  renderCount.current++;

  // Subscribe to form state changes
  useIsomorphicLayoutEffect(
    () =>
      control._subscribe({
        formState: _localProxyFormState.current,
        callback: (newFormState) => {
          updateFormState({
            ...control._formState,
            ...newFormState,
          });
          setValues(control._formValues as TFieldValues);
        },
      }),
    [control],
  );

  // Set valid state on mount
  React.useEffect(() => {
    control._setValid(true);
  }, [control]);

  // Get registered field names
  const registeredFields = React.useMemo(() => {
    const fieldNames: string[] = [];
    const collectFieldNames = (
      fields: Record<string, any>,
      prefix = '',
    ): void => {
      for (const key in fields) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        const field = fields[key];
        if (field && field._f) {
          fieldNames.push(fullPath);
        } else if (field && typeof field === 'object') {
          collectFieldNames(field, fullPath);
        }
      }
    };
    collectFieldNames(control._fields as Record<string, any>);
    return fieldNames;
  }, [control._fields]);

  // Get field array names
  const fieldArrays = React.useMemo(
    () => Array.from(control._names.array as Set<InternalFieldName>),

    [control._names.array],
  );

  const proxyFormState = React.useMemo(
    () =>
      getProxyFormState(
        formState,
        control,
        _localProxyFormState.current,
        false,
      ),
    [formState, control],
  );

  return {
    formState: proxyFormState,
    values,
    registeredFields,
    fieldArrays,
    renderCount: renderCount.current,
  };
}
