import * as React from 'react';
import { useFormContext } from './useFormContext';
import { useFormState } from './useFormState';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import getControllerValue from './logic/getControllerValue';
import isNameInFieldArray from './logic/isNameInFieldArray';
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

  const { defaultValuesRef, register, fieldsRef, fieldArrayNamesRef } =
    control || methods.control;

  // @ts-ignore
  const { onChange, onBlur, ref } = register(name, rules);
  const getInitialValue = () => {
    const isNotFieldArray = !isNameInFieldArray(
      fieldArrayNamesRef.current,
      name,
    );
    const value =
      isUndefined(fieldsRef.current[name]!.value) || !isNotFieldArray
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
        setInputStateValue(getControllerValue(event));
        const value = getControllerValue(event);

        onChange({
          custom: true,
          target: {
            value,
            name,
          },
        });
      },
      onBlur: () => {
        onBlur({
          custom: true,
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
