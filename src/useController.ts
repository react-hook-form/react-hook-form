import { useFormContext } from './useFormContext';
import { useFormState } from './useFormState';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import * as React from 'react';
import getInputValue from './logic/getInputValue';
import { EVENTS } from './constants';
import { FieldValues, UseControllerProps, UseControllerMethods } from './types';

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

  const { defaultValuesRef, register, fieldsRef } = control || methods.control;

  // @ts-ignore
  const { onChange, onBlur, ref } = register(name, rules);
  const getInitialValue = () => {
    const value = isUndefined(fieldsRef.current[name]!.value)
      ? isUndefined(defaultValue)
        ? get(defaultValuesRef.current, name)
        : defaultValue
      : fieldsRef.current[name]!.value;

    fieldsRef.current[name]!.value = value;
    return value;
  };

  const [value, setInputStateValue] = React.useState(getInitialValue());
  const { errors, dirty, touched, isValidating } = useFormState({
    control: control || methods.control,
  });

  return {
    field: {
      onChange: (event: any) => {
        setInputStateValue(getInputValue(event));
        onChange({
          target: {
            value: getInputValue(event),
            name,
          },
        });
      },
      onBlur: () => {
        onBlur({
          target: {
            name,
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
