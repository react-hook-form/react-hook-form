import React, { useEffect, useState } from 'react';
import { useFormContext } from './useFormContext';

interface ControllerProps<FormValuesKeys, ValueType> {
  /**
   * The name that will be used for register.
   *
   * @type {FormValuesKeys}
   * @memberof Props
   */
  name: FormValuesKeys;

  /**
   * The default value to provide to the internal state.
   * Take priority over useForm default value argument.
   */
  defaultValue?: ValueType;

  children(params: ControllerCommand<ValueType>): React.ReactElement;
}

interface ControllerCommand<ValueType> {
  value?: ValueType;
  onValueChange(data: ValueType): void;
}

/**
 *
 * @param props
 */
export function TypedController<FormValuesKeys extends string, InputValueType>(
  props: ControllerProps<FormValuesKeys, InputValueType>,
) {
  // TODO add fallback to default values, or just remove defaultValue prop and let form handle it
  const [internalValue, setInternalValue] = useState<
    InputValueType | undefined
  >(props.defaultValue);
  const form = useFormContext();

  const onValueChange = (data: InputValueType) => {
    form.setValue(props.name, data);
    setInternalValue(data);
  };

  useEffect(() => {
    if (props.name) {
      form.register({ name: props.name });
      form.setValue(props.name, props.defaultValue);
    }

    return () => form.unregister(props.name);
  }, [form, props.defaultValue, props.name]);

  return props.children({ value: internalValue, onValueChange });
}
