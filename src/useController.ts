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
  const getInitialValue = () =>
    (get(fieldsRef.current, name) &&
      isUndefined(get(fieldsRef.current, name).__field.value)) ||
    isNameInFieldArray(fieldArrayNamesRef.current, name)
      ? isUndefined(defaultValue)
        ? get(defaultValuesRef.current, name)
        : defaultValue
      : get(fieldsRef.current, name).__field.value;

  const [value, setInputStateValue] = React.useState(getInitialValue());
  const { errors, dirty, touched, isValidating } = useFormState({
    control: control || methods.control,
  });

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (!(name as string)) {
        return console.warn(
          '📋 Field is missing `name` prop. https://react-hook-form.com/api#Controller',
        );
      }

      if (isUndefined(value)) {
        console.warn(
          `📋 ${name} is missing in the 'defaultValue' prop of either its Controller (https://react-hook-form.com/api#Controller) or useForm (https://react-hook-form.com/api#useForm)`,
        );
      }
    }

    if (get(fieldsRef.current, name)) {
      get(fieldsRef.current, name).__field.value = getInitialValue();
    }

    const controllerSubscription = controllerSubjectRef.current.subscribe({
      next: (values) => setInputStateValue(get(values, name)),
    });

    return () => controllerSubscription.unsubscribe();
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
