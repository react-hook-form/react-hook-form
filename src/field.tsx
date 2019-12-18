import * as React from 'react';
import { get, isUndefined } from './utils';
import isBoolean from './utils/isBoolean';
import { EVENTS, VALIDATION_MODE } from './constants';
import { ValidationOptions } from './types';

export type EventFunction = (
  args: any,
) => {
  value?: any;
  checked?: boolean;
};

export type Props = {
  children?: React.ReactNode;
  innerProps?: any;
  setValue?: (name: string, value: any, trigger?: boolean) => void;
  register?: (ref: any, rules: ValidationOptions) => (name: string) => void;
  unregister?: (name: string) => void;
  name: string;
  as: React.ElementType<any> | React.FunctionComponent<any> | string | any;
  rules?: ValidationOptions;
  value?: string | boolean;
  onChange?: (value: any) => void;
  onBlur?: (value: any) => void;
  mode?: 'onBlur' | 'onChange' | 'onSubmit';
  defaultValue?: string;
  defaultChecked?: boolean;
  onChangeName?: string;
  onChangeEvent?: EventFunction;
  onBlurName?: string;
  onBlurEvent?: EventFunction;
  control: any;
};

function getValue(target: any, { isCheckbox }: { isCheckbox: boolean }) {
  return target
    ? isCheckbox
      ? isUndefined(target.checked)
        ? target
        : target.checked
      : isUndefined(target.value)
      ? target
      : target.value
    : target;
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
    mode,
    reValidateMode,
    // formState,
  },
  ...rest
}: Props) => {
  const defaultValue = defaultValues[name];
  const [inputState, setInputState] = React.useState(defaultValue);
  const valueRef = React.useRef(defaultValue);
  const value = inputState || defaultValue || '';
  const isCheckboxInput = isBoolean(value);

  const shouldValidate = () => {
    return !!get(errors, name);
  };

  const commonTask = (target: any) => {
    const data = getValue(target, { isCheckbox: isCheckboxInput });
    setInputState(data);
    valueRef.current = data;
    return data;
  };

  const eventWrapper = (event: EventFunction, eventName: string) => {
    return async (...arg: any) => {
      const data = commonTask(await event(arg));
      const isBlurEvent = eventName === EVENTS.BLUR;
      setValue(
        name,
        data,
        (mode.isOnChange && !isBlurEvent) || (mode.isOnBlur && isBlurEvent),
      );
    };
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
    setValue(name, data, shouldValidate());
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

    return (): void => {
      unregister(name);
    };
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
    ...(mode.isOnBlur || reValidateMode.isReValidateOnBlur
      ? onBlurEvent
        ? {
            [onBlurName || VALIDATION_MODE.onBlur]: eventWrapper(
              onBlurEvent,
              VALIDATION_MODE.onBlur,
            ),
          }
        : { onBlur: handleBlur }
      : {}),
    ...(isCheckboxInput ? { checked: inputState } : {}),
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
