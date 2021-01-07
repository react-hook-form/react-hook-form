import { useFormContext } from './useFormContext';
import isNameInFieldArray from './logic/isNameInFieldArray';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import * as React from 'react';
import isFunction from './utils/isFunction';
import skipValidation from './logic/skipValidation';
import getInputValue from './logic/getInputValue';
import set from './utils/set';
import {
  FieldValues,
  UseControllerOptions,
  UseControllerMethods,
} from './types';

export function useController<TFieldValues extends FieldValues = FieldValues>({
  name,
  rules,
  defaultValue,
  control,
  onFocus,
}: UseControllerOptions<TFieldValues>): UseControllerMethods<TFieldValues> {
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
    setValue,
    register,
    unregister,
    trigger,
    mode,
    reValidateMode: { isReValidateOnBlur, isReValidateOnChange },
    formState,
    formStateRef: {
      current: { isSubmitted, touched, errors },
    },
    updateFormState,
    readFormStateRef,
    fieldsRef,
    fieldArrayNamesRef,
    shallowFieldsStateRef,
  } = control || methods.control;

  const isNotFieldArray = !isNameInFieldArray(fieldArrayNamesRef.current, name);
  const getInitialValue = () =>
    !isUndefined(get(shallowFieldsStateRef.current, name)) && isNotFieldArray
      ? get(shallowFieldsStateRef.current, name)
      : isUndefined(defaultValue)
      ? get(defaultValuesRef.current, name)
      : defaultValue;
  const [value, setInputStateValue] = React.useState(getInitialValue());
  const valueRef = React.useRef(value);
  const ref = React.useRef({
    focus: () => null,
  });
  const onFocusRef = React.useRef(
    onFocus ||
      (() => {
        if (isFunction(ref.current.focus)) {
          ref.current.focus();
        }

        if (process.env.NODE_ENV !== 'production') {
          if (!isFunction(ref.current.focus)) {
            console.warn(
              `📋 'ref' from Controller render prop must be attached to a React component or a DOM Element whose ref provides a 'focus()' method`,
            );
          }
        }
      }),
  );

  const shouldValidate = React.useCallback(
    (isBlurEvent?: boolean) =>
      !skipValidation({
        isBlurEvent,
        isReValidateOnBlur,
        isReValidateOnChange,
        isSubmitted,
        isTouched: !!get(touched, name),
        ...mode,
      }),
    [
      isReValidateOnBlur,
      isReValidateOnChange,
      isSubmitted,
      touched,
      name,
      mode,
    ],
  );

  const commonTask = React.useCallback(([event]: any[]) => {
    const data = getInputValue(event);
    setInputStateValue(data);
    valueRef.current = data;
    return data;
  }, []);

  const registerField = React.useCallback(
    (shouldUpdateValue?: boolean) => {
      if (process.env.NODE_ENV !== 'production') {
        if (!name) {
          return console.warn(
            '📋 Field is missing `name` prop. https://react-hook-form.com/api#Controller',
          );
        }
      }

      if (fieldsRef.current[name]) {
        fieldsRef.current[name] = {
          ref: fieldsRef.current[name]!.ref,
          ...rules,
        };
      } else {
        register(
          Object.defineProperties(
            {
              name,
              focus: onFocusRef.current,
            },
            {
              value: {
                set(data) {
                  setInputStateValue(data);
                  valueRef.current = data;
                },
                get() {
                  return valueRef.current;
                },
              },
            },
          ),
          rules,
        );

        shouldUpdateValue = isUndefined(get(defaultValuesRef.current, name));
      }

      shouldUpdateValue &&
        isNotFieldArray &&
        setInputStateValue(getInitialValue());
    },
    [rules, name, register],
  );

  React.useEffect(() => () => unregister(name), [name]);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (isUndefined(value)) {
        console.warn(
          `📋 ${name} is missing in the 'defaultValue' prop of either its Controller (https://react-hook-form.com/api#Controller) or useForm (https://react-hook-form.com/api#useForm)`,
        );
      }

      if (!isNotFieldArray && isUndefined(defaultValue)) {
        console.warn(
          '📋 Controller is missing `defaultValue` prop when using `useFieldArray`. https://react-hook-form.com/api#Controller',
        );
      }
    }

    registerField();
  }, [registerField]);

  React.useEffect(() => {
    !fieldsRef.current[name] && registerField(true);
  });

  const onBlur = React.useCallback(() => {
    if (readFormStateRef.current.touched && !get(touched, name)) {
      set(touched, name, true);
      updateFormState({
        touched,
      });
    }

    shouldValidate(true) && trigger(name);
  }, [name, updateFormState, shouldValidate, trigger, readFormStateRef]);

  const onChange = React.useCallback(
    (...event: any[]) =>
      setValue(name, commonTask(event), {
        shouldValidate: shouldValidate(),
        shouldDirty: true,
      }),
    [setValue, name, shouldValidate],
  );

  return {
    field: {
      onChange,
      onBlur,
      name,
      value,
      ref,
    },
    meta: Object.defineProperties(
      {
        invalid: !!get(errors, name),
      },
      {
        isDirty: {
          get() {
            return !!get(formState.dirtyFields, name);
          },
        },
        isTouched: {
          get() {
            return !!get(formState.touched, name);
          },
        },
      },
    ),
  };
}
