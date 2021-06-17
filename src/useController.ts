import * as React from 'react';

import getControllerValue from './logic/getControllerValue';
import isNameInFieldArray from './logic/isNameInFieldArray';
import get from './utils/get';
import isUndefined from './utils/isUndefined';
import { EVENTS } from './constants';
import {
  FieldPath,
  FieldValues,
  InternalFieldName,
  UseControllerProps,
  UseControllerReturn,
} from './types';
import { useFormContext } from './useFormContext';
import { useFormState } from './useFormState';

export function useController<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: UseControllerProps<TFieldValues, TName>,
): UseControllerReturn<TFieldValues, TName> {
  const methods = useFormContext<TFieldValues>();
  const {
    name,
    rules,
    defaultValue,
    control = methods.control,
    shouldUnregister,
  } = props;

  const isFieldArray = isNameInFieldArray(control.namesRef.array, name);
  const field = get(control.fieldsRef, name);
  const [value, setInputStateValue] = React.useState(
    isFieldArray || !field || !field._f
      ? isFieldArray || isUndefined(get(control.defaultValuesRef, name))
        ? defaultValue
        : get(control.defaultValuesRef, name)
      : field._f.value,
  );
  const { onChange, onBlur, ref } = control.register(name, {
    ...rules,
    value,
  });
  const formState = useFormState({
    control: control || methods.control,
    name,
  });

  React.useEffect(() => {
    const controllerSubscription = control.subjectsRef.control.subscribe({
      next: (data) =>
        (!data.name || name === data.name) &&
        setInputStateValue(get(data.values, name)),
    });

    return () => {
      controllerSubscription.unsubscribe();
      const shouldUnmountField = control.shouldUnmount || shouldUnregister;

      if (
        isFieldArray
          ? shouldUnmountField && !control.inFieldArrayActionRef
          : shouldUnmountField
      ) {
        control.unregister(name);
      } else {
        const field = get(control.fieldsRef, name);

        if (field && field._f) {
          field._f.mount = false;
        }
      }
    };
  }, [name]);

  return {
    field: {
      onChange: (event: any) => {
        const value = getControllerValue(event);
        setInputStateValue(value);

        onChange({
          target: {
            value,
            name: name as InternalFieldName,
          },
          type: EVENTS.CHANGE,
        });
      },
      onBlur: () => {
        onBlur({
          target: {
            name: name as InternalFieldName,
          },
          type: EVENTS.BLUR,
        });
      },
      name,
      value,
      ref: (elm) =>
        elm &&
        ref({
          focus: () => elm.focus && elm.focus(),
        }),
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
