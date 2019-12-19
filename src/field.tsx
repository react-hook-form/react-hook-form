import * as React from 'react';
import isBoolean from './utils/isBoolean';
import isUndefined from './utils/isUndefined';
import skipValidation from './logic/skipValidation';
import { EVENTS, VALIDATION_MODE } from './constants';
import { Mode, ValidationOptions } from './types';

export type EventFunction = (
  args: any,
) => {
  value?: any;
  checked?: boolean;
};

export type Props = {
  name: string;
  as: React.ElementType<any> | React.FunctionComponent<any> | string | any;
  rules?: ValidationOptions;
  onChange?: (value: any) => void;
  onBlur?: (value: any) => void;
  mode?: Mode;
  onChangeName?: string;
  onChangeEvent?: EventFunction;
  onBlurName?: string;
  onBlurEvent?: EventFunction;
  control: any;
};

function getValue(target: any, isCheckbox: boolean) {
  return isCheckbox
    ? isUndefined(target.checked)
      ? target
      : target.checked
    : isUndefined(target.value)
    ? target
    : target.value;
}

const RHFInput = ({
  name,
  rules,
  as: InnerComponent,
  onChange,
  onBlur,
  onChangeName,
  onChangeEvent,
  onBlurName,
  onBlurEvent,
  control: {
    defaultValues,
    setValue,
    register,
    unregister,
    errors,
    mode: { isOnSubmit, isOnBlur },
    reValidateMode: { isReValidateOnBlur, isReValidateOnSubmit },
    formState: { isSubmitted },
  },
  ...rest
}: Props) => {
  const [value, setInputState] = React.useState(
    isUndefined(defaultValues[name]) ? '' : defaultValues[name],
  );
  const valueRef = React.useRef(value);
  const isCheckboxInput = isBoolean(value);

  const shouldValidate = (isBlurEvent?: boolean) =>
    !skipValidation({
      hasError: !!errors[name],
      isBlurEvent,
      isOnBlur,
      isOnSubmit,
      isReValidateOnBlur,
      isReValidateOnSubmit,
      isSubmitted,
    });

  const commonTask = (target: any) => {
    const data = getValue(target, isCheckboxInput);
    setInputState(data);
    valueRef.current = data;
    return data;
  };

  const eventWrapper = (event: EventFunction, eventName: string) => async (
    ...arg: any
  ) => {
    const data = commonTask(await event(arg));
    const isBlurEvent = eventName === EVENTS.BLUR;
    setValue(name, data, shouldValidate(isBlurEvent));
  };

  const handleChange = (e: any) => {
    const data = commonTask(e && e.target ? e.target : e);
    setValue(name, data, shouldValidate());
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e: any) => {
    const data = commonTask(e && e.target ? e.target : e);
    setValue(name, data, shouldValidate(true));
    if (onBlur) {
      onBlur(e);
    }
  };

  React.useEffect(() => {
    register(
      Object.defineProperty(
        {
          name,
        },
        'value',
        {
          set(data) {
            setInputState(data);
            valueRef.current = data;
          },
          get() {
            return valueRef.current;
          },
        },
      ),
      { ...rules },
    );

    return (): void => unregister(name);
  }, [register, unregister, name]); // eslint-disable-line react-hooks/exhaustive-deps

  const props = {
    ...(onChangeEvent
      ? {
          [onChangeName || VALIDATION_MODE.onChange]: eventWrapper(
            onChangeEvent,
            VALIDATION_MODE.onChange,
          ),
        }
      : { onChange: handleChange }),
    ...(isOnBlur || isReValidateOnBlur
      ? onBlurEvent
        ? {
            [onBlurName || VALIDATION_MODE.onBlur]: eventWrapper(
              onBlurEvent,
              VALIDATION_MODE.onBlur,
            ),
          }
        : { onBlur: handleBlur }
      : {}),
    ...(isCheckboxInput ? { checked: value } : {}),
    value,
    ...rest,
  };

  return React.isValidElement(InnerComponent) ? (
    React.cloneElement(InnerComponent, props)
  ) : (
    <InnerComponent {...props} />
  );
};

export { RHFInput };
