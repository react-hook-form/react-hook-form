import React from 'react';

import getEventValue from './logic/getEventValue';
import isNameInFieldArray from './logic/isNameInFieldArray';
import get from './utils/get';
import { EVENTS } from './constants';
import {
  ControllerFieldState,
  Field,
  FieldPath,
  FieldPathValue,
  FieldValues,
  InternalFieldName,
  UseControllerProps,
  UseControllerReturn,
} from './types';
import { useFormContext } from './useFormContext';
import { useFormState } from './useFormState';
import { useWatch } from './useWatch';

/**
 * Custom hook to work with controlled component, this function provide you with both form and field level state. Re-render is isolated at the hook level.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/usecontroller) • [Demo](https://codesandbox.io/s/usecontroller-0o8px)
 *
 * @param props - the path name to the form field value, and validation rules.
 *
 * @returns field properties, field and form state. {@link UseControllerReturn}
 *
 * @example
 * ```tsx
 * function Input(props) {
 *   const { field, fieldState, formState } = useController(props);
 *   return (
 *     <div>
 *       <input {...field} placeholder={props.name} />
 *       <p>{fieldState.isTouched && "Touched"}</p>
 *       <p>{formState.isSubmitted ? "submitted" : ""}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useController<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: UseControllerProps<TFieldValues, TName>,
): UseControllerReturn<TFieldValues, TName> {
  const methods = useFormContext<TFieldValues>();
  const { name, control = methods.control, shouldUnregister } = props;
  const isArrayField = isNameInFieldArray(control._names.array, name);
  const value = useWatch({
    control,
    name,
    defaultValue: get(
      control._formValues,
      name,
      get(control._defaultValues, name, props.defaultValue),
    ),
    exact: true,
  }) as FieldPathValue<TFieldValues, TName>;
  const formState = useFormState({
    control,
    name,
  });

  const _registerProps = React.useRef(
    control.register(name, {
      ...props.rules,
      value,
    }),
  );

  React.useEffect(() => {
    const updateMounted = (name: InternalFieldName, value: boolean) => {
      const field: Field = get(control._fields, name);

      if (field) {
        field._f.mount = value;
      }
    };

    updateMounted(name, true);

    return () => {
      const _shouldUnregisterField =
        control._options.shouldUnregister || shouldUnregister;

      (
        isArrayField
          ? _shouldUnregisterField && !control._stateFlags.action
          : _shouldUnregisterField
      )
        ? control.unregister(name)
        : updateMounted(name, false);
    };
  }, [name, control, isArrayField, shouldUnregister]);

  return {
    field: {
      name,
      value,
      onChange: React.useCallback(
        (event) =>
          _registerProps.current.onChange({
            target: {
              value: getEventValue(event),
              name: name as InternalFieldName,
            },
            type: EVENTS.CHANGE,
          }),
        [name],
      ),
      onBlur: React.useCallback(
        () =>
          _registerProps.current.onBlur({
            target: {
              value: get(control._formValues, name),
              name: name as InternalFieldName,
            },
            type: EVENTS.BLUR,
          }),
        [name, control],
      ),
      ref: (elm) => {
        const field = get(control._fields, name);

        if (field && elm) {
          field._f.ref = {
            focus: () => elm.focus(),
            select: () => elm.select(),
            setCustomValidity: (message: string) =>
              elm.setCustomValidity(message),
            reportValidity: () => elm.reportValidity(),
          };
        }
      },
    },
    formState,
    fieldState: Object.defineProperties(
      {},
      {
        invalid: {
          enumerable: true,
          get: () => !!get(formState.errors, name),
        },
        isDirty: {
          enumerable: true,
          get: () => !!get(formState.dirtyFields, name),
        },
        isTouched: {
          enumerable: true,
          get: () => !!get(formState.touchedFields, name),
        },
        error: {
          enumerable: true,
          get: () => get(formState.errors, name),
        },
      },
    ) as ControllerFieldState,
  };
}
