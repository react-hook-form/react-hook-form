import * as React from 'react';
import { useFormContext } from './useFormContext';
import { useFormState } from './useFormState';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import getControllerValue from './logic/getControllerValue';
import isNameInFieldArray from './logic/isNameInFieldArray';
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
  const getInitialValue = () =>
    (get(fieldsRef.current, name) &&
      isUndefined(get(fieldsRef.current, name)._f.value)) ||
    isNameInFieldArray(fieldArrayNamesRef.current, name)
      ? isUndefined(defaultValue)
        ? get(defaultValuesRef.current, name)
        : defaultValue
      : get(fieldsRef.current, name)._f.value;

  const [value, setInputStateValue] = React.useState(getInitialValue());
  const { errors, dirtyFields, touchedFields, isValidating } = useFormState({
    control: control || methods.control,
  });

  React.useEffect(() => {
    if (get(fieldsRef.current, name)) {
      get(fieldsRef.current, name)._f.value = getInitialValue();
    }

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
    meta: {
      invalid: !!get(errors, name),
      isDirty: !!get(dirtyFields, name),
      isTouched: !!get(touchedFields, name),
      error: get(errors, name),
      isValidating,
    },
  };
}
