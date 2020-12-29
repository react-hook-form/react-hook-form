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
  UseControllerMethods,
  InternalFieldName,
} from './types';

export function useController<TFieldValues extends FieldValues = FieldValues>({
  name,
  rules,
  defaultValue,
  control,
}: UseControllerProps<TFieldValues>): UseControllerMethods<TFieldValues> {
  const methods = useFormContext<TFieldValues>();

  if (process.env.NODE_ENV !== 'production') {
    if (!control && !methods) {
      throw new Error(
        '📋 Controller is missing `control` prop. https://react-hook-form.com/api#Controller',
      );
    }
  }

  const {
    defaultValuesRef,
    register,
    fieldsRef,
    fieldArrayNamesRef,
    controllerSubjectRef,
  } = control || methods.control;

  const { onChange, onBlur, ref } = register(name, rules);
  const getInitialValue = () => {
    return isUndefined(fieldsRef.current[name]!.value) ||
      isNameInFieldArray(fieldArrayNamesRef.current, name)
      ? isUndefined(defaultValue)
        ? get(defaultValuesRef.current, name)
        : defaultValue
      : fieldsRef.current[name]!.value;
  };

  const [value, setInputStateValue] = React.useState(getInitialValue());
  const { errors, dirty, touched, isValidating } = useFormState({
    control: control || methods.control,
  });

  React.useEffect(() => {
    fieldsRef.current[name]!.value = getInitialValue();
    const tearDown = controllerSubjectRef.current.subscribe({
      next: (values) => setInputStateValue(get(values, name, '')),
    });

    return () => tearDown.unsubscribe();
  }, []);

  return {
    field: {
      onChange: (event: any) => {
        setInputStateValue(getControllerValue(event));
        const value = getControllerValue(event);

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
      isDirty: !!get(dirty, name),
      isTouched: !!get(touched, name),
      isValidating,
    },
  };
}
