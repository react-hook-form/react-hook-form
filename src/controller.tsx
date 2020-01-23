import * as React from 'react';
import isBoolean from './utils/isBoolean';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import getInputValue from './logic/getInputValue';
import skipValidation from './logic/skipValidation';
import isNameInFieldArray from './logic/isNameInFieldArray';
import { useFormContext } from './useFormContext';
import { VALIDATION_MODE, VALUE } from './constants';
import { Control, ControllerProps, EventFunction, Field } from './types';

const Controller = <ControlProp extends Control = Control>({
  name,
  rules,
  as: InnerComponent,
  onChange,
  onChangeName = VALIDATION_MODE.onChange,
  onBlurName = VALIDATION_MODE.onBlur,
  valueName,
  defaultValue,
  control,
  ...rest
}: ControllerProps<ControlProp>) => {
  const methods = useFormContext();
  const {
    defaultValuesRef,
    setValue,
    register,
    unregister,
    errorsRef,
    removeEventListener,
    triggerValidation,
    mode: { isOnSubmit, isOnBlur },
    reValidateMode: { isReValidateOnBlur, isReValidateOnSubmit },
    formState: { isSubmitted },
    fieldsRef,
    fieldArrayNamesRef,
  } = control || methods.control;
  const [value, setInputStateValue] = React.useState(
    isUndefined(defaultValue)
      ? get(defaultValuesRef.current, name)
      : defaultValue,
  );
  const valueRef = React.useRef(value);
  const isCheckboxInput = isBoolean(value);

  const shouldValidate = () =>
    !skipValidation({
      hasError: !!get(errorsRef.current, name),
      isOnBlur,
      isOnSubmit,
      isReValidateOnBlur,
      isReValidateOnSubmit,
      isSubmitted,
    });

  const commonTask = (target: any) => {
    const data = getInputValue(target, isCheckboxInput);
    setInputStateValue(data);
    valueRef.current = data;
    return data;
  };

  const eventWrapper = (event: EventFunction) => (...arg: any) =>
    setValue(name, commonTask(event(arg)), shouldValidate());

  const handleChange = (e: any) => {
    const data = commonTask(e && e.target ? e.target : e);
    setValue(name, data, shouldValidate());
  };

  const registerField = () => {
    if (
      isNameInFieldArray(fieldArrayNamesRef.current, name) &&
      fieldsRef.current[name]
    ) {
      removeEventListener(fieldsRef.current[name] as Field, true);
    }

    register(
      Object.defineProperty(
        {
          name,
        },
        VALUE,
        {
          set(data) {
            setInputStateValue(data);
            valueRef.current = data;
          },
          get() {
            return valueRef.current;
          },
        },
      ),
      { ...rules },
    );
  };

  if (!fieldsRef.current[name]) {
    registerField();
  }

  React.useEffect(() => {
    registerField();
    return () => {
      if (!isNameInFieldArray(fieldArrayNamesRef.current, name)) {
        unregister(name);
      }
    };
  }, [name]);

  const props = {
    name,
    ...rest,
    ...(onChange
      ? { [onChangeName]: eventWrapper(onChange) }
      : { [onChangeName]: handleChange }),
    ...(isOnBlur || isReValidateOnBlur
      ? { [onBlurName]: () => triggerValidation(name) }
      : {}),
    ...{ [valueName || (isCheckboxInput ? 'checked' : VALUE)]: value },
  };

  return React.isValidElement(InnerComponent) ? (
    React.cloneElement(InnerComponent, props)
  ) : (
    <InnerComponent {...props} />
  );
};

export { Controller };
