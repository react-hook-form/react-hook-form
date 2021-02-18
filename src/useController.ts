import * as React from 'react';
import { useFormContext } from './useFormContext';
import { useFormState } from './useFormState';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import getControllerValue from './logic/getControllerValue';
import isNameInFieldArray from './logic/isNameInFieldArray';
import getFieldValue from './logic/getFieldValue';
import { EVENTS } from './constants';
import {
  FieldValues,
  UseControllerProps,
  UseControllerReturn,
  InternalFieldName,
} from './types';

export function useController<TFieldValues extends FieldValues = FieldValues>({
  name,
  rules,
  defaultValue,
  control,
}: UseControllerProps<TFieldValues>): UseControllerReturn<TFieldValues> {
  const methods = useFormContext<TFieldValues>();
  const {
    defaultValuesRef,
    register,
    fieldsRef,
    fieldArrayNamesRef,
    controllerSubjectRef,
  } = control || methods.control;

  const { onChange, onBlur, ref } = register(name, rules);
  const getInitialValue = (initial?: boolean) =>
    initial ||
    isUndefined(getFieldValue(get(fieldsRef.current, name))) ||
    isNameInFieldArray(fieldArrayNamesRef.current, name)
      ? isUndefined(defaultValue)
        ? get(defaultValuesRef.current, name)
        : defaultValue
      : getFieldValue(get(fieldsRef.current, name));

  const [value, setInputStateValue] = React.useState(getInitialValue());
  const formState = useFormState({
    control: control || methods.control,
  });

  React.useEffect(() => {
    get(fieldsRef.current, name)._f.value = getInitialValue(true);

    const controllerSubscription = controllerSubjectRef.current.subscribe({
      next: (values) => setInputStateValue(get(values, name)),
    });

    return () => controllerSubscription.unsubscribe();
  }, []);

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
      ref,
    },
    meta: Object.defineProperties(
      {},
      {
        invalid: {
          get() {
            return !!get(formState.errors, name);
          },
        },
        isDirty: {
          get() {
            return !!get(formState.dirtyFields, name);
          },
        },
        isTouched: {
          get() {
            return !!get(formState.touchedFields, name);
          },
        },
        error: {
          get() {
            return get(formState.errors, name);
          },
        },
        isValidating: {
          get() {
            return formState.isValidating;
          },
        },
      },
    ),
  };
}
