import * as React from 'react';
import { useController } from './useController';
import { ControllerProps, FieldValues } from './types';

type NativeInputs = 'input' | 'select' | 'textarea';

const Controller = <
  TAs extends React.ReactElement | React.ComponentType<any> | NativeInputs,
  TFieldValues extends FieldValues = FieldValues
>(
  props: ControllerProps<TAs, TFieldValues>,
) => {
  const { rules, as, render, defaultValue, control, onFocus, ...rest } = props;
  const { inputProps, inputState } = useController(props);

  const componentProps = {
    ...rest,
    ...inputState,
  };

  return as
    ? React.isValidElement(as)
      ? React.cloneElement(as, componentProps)
      : React.createElement(as as NativeInputs, componentProps as any)
    : render
    ? render(inputProps, inputState)
    : null;
};

export { Controller };
