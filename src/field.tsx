import * as React from 'react';
import { get, isCheckbox, isUndefined } from './utils';
import { useFormContext } from './useFormContext';
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
  type?: string;
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
  // the following logic is specific for react-select
  if (target && (Array.isArray(target) || (target.label && target.value))) {
    return target;
  }

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
  type,
  value,
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
  },
  ...rest
}: Props) => {
  const isCheckboxInput = isCheckbox(type);
  // const formState = formState;
  const defaultValue = defaultValues[name];
  const [inputState, setInputState] = React.useState(defaultValue || value);
  const valueRef = React.useRef(defaultValue || value);
  const methods = useFormContext() || {};
  const setValueMethod = setValue || methods.setValue;
  const registerMethod = register || methods.register;
  const unregisterMethod = unregister || methods.unregister;

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
      setValueMethod(
        name,
        data,
        (mode.isOnChange && eventName === 'onChange') ||
          (mode.isOnBlur && eventName === 'onBlur'),
      );
    };
  };

  const handleChange = (e: any) => {
    const data = commonTask(e && e.target ? e.target : e);
    setValueMethod(name, data, shouldValidate());
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e: any) => {
    const data = commonTask(e && e.target ? e.target : e);
    setValueMethod(name, data, shouldValidate());
    if (onBlur) {
      onBlur(e);
    }
  };

  React.useEffect(() => {
    registerMethod(
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
      if (unregisterMethod) {
        unregisterMethod(name);
      }
    };
  }, [registerMethod, unregisterMethod, name]); // eslint-disable-line react-hooks/exhaustive-deps

  const props = {
    ...(onChangeEvent
      ? {
          [onChangeName || 'onChange']: eventWrapper(onChangeEvent, 'onChange'),
        }
      : { onChange: handleChange }),
    ...(mode.isOnBlur || reValidateMode.isReValidateOnBlur
      ? onBlurEvent
        ? {
            [onBlurName || 'onBlur']: eventWrapper(onBlurEvent, 'onBlur'),
          }
        : { onBlur: handleBlur }
      : {}),
    value: inputState || value || '',
    ...(isCheckboxInput ? { checked: inputState } : {}),
    ...rest,
  };

  return React.isValidElement(InnerComponent) ? (
    React.cloneElement(InnerComponent, props)
  ) : (
    <InnerComponent {...props} />
  );
};

export { RHFInput };
