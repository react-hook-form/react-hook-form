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
>({
  name,
  rules,
  defaultValue,
  control,
  shouldUnregister,
}: UseControllerProps<TFieldValues, TName>): UseControllerReturn<
  TFieldValues,
  TName
> {
  const methods = useFormContext<TFieldValues>();
  const {
    unregister,
    register,
    _shouldUnregister,
    _defaultValues,
    _fields,
    _names,
    _subjects,
    _isInAction,
    _formValues,
  } = control || methods.control;

  const fieldValue = get(_formValues, name);
  const [value, setInputStateValue] = React.useState(
    !isUndefined(fieldValue)
      ? fieldValue
      : isUndefined(get(_defaultValues, name))
      ? defaultValue
      : get(_defaultValues, name),
  );
  const { onChange, onBlur, ref } = register(name, {
    ...rules,
    value,
  });

  const formState = useFormState({
    control: control || methods.control,
    name,
  });

  React.useEffect(() => {
    const controllerSubscription = _subjects.control.subscribe({
      next: (data) =>
        (!data.name || name === data.name) &&
        setInputStateValue(get(data.values, name)),
    });

    return () => {
      controllerSubscription.unsubscribe();
      const _shouldUnregisterField = _shouldUnregister || shouldUnregister;

      if (
        isNameInFieldArray(_names.array, name)
          ? _shouldUnregisterField && !_isInAction
          : _shouldUnregisterField
      ) {
        unregister(name);
      } else {
        const field = get(_fields, name);

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
          setCustomValidity: (message: string) =>
            elm.setCustomValidity(message),
          reportValidity: () => elm.reportValidity(),
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
