import React from 'react';

import getEventValue from './logic/getEventValue';
import isNameInFieldArray from './logic/isNameInFieldArray';
import get from './utils/get';
import { EVENTS } from './constants';
import {
  Field,
  FieldPath,
  FieldPathValue,
  FieldValues,
  InternalFieldName,
  UnpackNestedValue,
  UseControllerProps,
  UseControllerReturn,
} from './types';
import { useFormContext } from './useFormContext';
import { useFormState } from './useFormState';
import { useWatch } from './useWatch';

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
    exact: !isArrayField,
  }) as UnpackNestedValue<FieldPathValue<TFieldValues, TName>>;
  const formState = useFormState({
    control,
    name,
  });
  const _name = React.useRef(name);

  _name.current = name;

  const registerProps = control.register(name, {
    ...props.rules,
    value,
  });

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

      if (
        isArrayField
          ? _shouldUnregisterField && !control._stateFlags.action
          : _shouldUnregisterField
      ) {
        control.unregister(name, { keepDefaultValue: true });
      } else {
        updateMounted(name, false);
      }
    };
  }, [name, control, isArrayField, shouldUnregister]);

  return {
    field: {
      onChange: (event) => {
        registerProps.onChange({
          target: {
            value: getEventValue(event),
            name: name as InternalFieldName,
          },
          type: EVENTS.CHANGE,
        });
      },
      onBlur: () => {
        registerProps.onBlur({
          target: {
            value: get(control._formValues, name),
            name: name as InternalFieldName,
          },
          type: EVENTS.BLUR,
        });
      },
      name,
      value,
      ref: (elm) => {
        const field = get(control._fields, name);

        if (elm && field && elm.focus) {
          field._f.ref = {
            focus: () => elm.focus(),
            setCustomValidity: (message: string) =>
              elm.setCustomValidity(message),
            reportValidity: () => elm.reportValidity(),
          };
        }
      },
    },
    formState,
    fieldState: {
      invalid: !!get(formState.errors, name),
      isDirty: !!get(formState.dirtyFields, name),
      isTouched: !!get(formState.touchedFields, name),
      error: get(formState.errors, name),
    },
  };
}
