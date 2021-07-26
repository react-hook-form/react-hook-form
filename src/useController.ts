import * as React from 'react';

import getControllerValue from './logic/getControllerValue';
import isNameInFieldArray from './logic/isNameInFieldArray';
import get from './utils/get';
import { EVENTS } from './constants';
import {
  Field,
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
  const { name, control = methods.control, shouldUnregister } = props;
  const [value, setInputStateValue] = React.useState(
    get(
      control._formValues,
      name,
      get(control._defaultValues, name, props.defaultValue),
    ),
  );
  const formState = useFormState({
    control: control || methods.control,
    name,
  });

  const registerProps = control.register(name, {
    ...props.rules,
    value,
  });

  const updateMounted = (name: InternalFieldName, value: boolean) => {
    const field: Field = get(control._fields, name);

    if (field) {
      field._f.mount = value;
    }
  };

  React.useEffect(() => {
    const controllerSubscription = control._subjects.control.subscribe({
      next: (data) =>
        (!data.name || name === data.name) &&
        setInputStateValue(get(data.values, name)),
    });
    updateMounted(name, true);

    return () => {
      controllerSubscription.unsubscribe();
      const _shouldUnregisterField =
        control._shouldUnregister || shouldUnregister;

      if (
        isNameInFieldArray(control._names.array, name)
          ? _shouldUnregisterField && !control._isInAction.val
          : _shouldUnregisterField
      ) {
        control.unregister(name);
      } else {
        updateMounted(name, false);
      }
    };
  }, [name, control, shouldUnregister]);

  return {
    field: {
      onChange: (event: any) => {
        const value = getControllerValue(event);
        setInputStateValue(value);

        registerProps.onChange({
          target: {
            value,
            name: name as InternalFieldName,
          },
          type: EVENTS.CHANGE,
        });
      },
      onBlur: () => {
        registerProps.onBlur({
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
        registerProps.ref({
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
