import * as React from 'react';
import isBoolean from './utils/isBoolean';
import isUndefined from './utils/isUndefined';
import get from './utils/get';
import getInputValue from './logic/getInputValue';
import skipValidation from './logic/skipValidation';
import isNameInFieldArray from './logic/isNameInFieldArray';
import { useFormContext } from './useFormContext';
import { EVENTS, VALIDATION_MODE, VALUE } from './constants';
import { Control, ControllerProps, EventFunction } from './types';

const Controller = <ControlProp extends Control = Control>({
  name,
  rules,
  as: InnerComponent,
  onChange,
  onBlur,
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
    errors,
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
  const currentError = get(errors, name);

  const shouldValidate = (isBlurEvent?: boolean) =>
    !skipValidation({
      hasError: !!currentError,
      isBlurEvent,
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

  const eventWrapper = (event: EventFunction, eventName: string) => (
    ...arg: any
  ) => {
    const data = commonTask(event(arg));
    const isBlurEvent = eventName === EVENTS.BLUR;
    setValue(name, data, shouldValidate(isBlurEvent));
  };

  const handleChange = (e: any) => {
    const data = commonTask(e && e.target ? e.target : e);
    setValue(name, data, shouldValidate());
  };

  const handleBlur = (e: any) => {
    const data = commonTask(e && e.target ? e.target : e);
    setValue(name, data, shouldValidate(true));
  };

  const registerField = () =>
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

  if (!fieldsRef.current[name]) {
    registerField();
  }

  React.useEffect(
    () => {
      const fieldArrayNames = fieldArrayNamesRef.current;
      registerField();
      return () => {
        if (!isNameInFieldArray(fieldArrayNames, name)) {
          unregister(name);
        }
      };
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [name],
  );

  const props = {
    name,
    ...rest,
    ...(onChange
      ? { [onChangeName]: eventWrapper(onChange, EVENTS.CHANGE) }
      : { [onChangeName]: handleChange }),
    ...(isOnBlur || isReValidateOnBlur
      ? onBlur
        ? { [onBlurName]: eventWrapper(onBlur, EVENTS.BLUR) }
        : { [onBlurName]: handleBlur }
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
