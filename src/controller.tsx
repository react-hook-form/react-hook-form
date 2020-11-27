import * as React from 'react';
import { useController } from './useController';
import { Control } from './types';
import { ControllerProps } from './types';

type NativeInputs = 'input' | 'select' | 'textarea';

const Controller = <
  TAs extends React.ReactElement | React.ComponentType<any> | NativeInputs,
  TControl extends Control = Control
>(
  props: ControllerProps<TAs, TControl>,
) => {
  const { rules, as, render, defaultValue, control, onFocus, ...rest } = props;
  const { field } = useController(props);

  const componentProps = {
    ...rest,
    ...field,
  };

  return as
    ? React.isValidElement(as)
      ? React.cloneElement(as, componentProps)
      : React.createElement(as as NativeInputs, componentProps as any)
    : render
    ? render(field)
    : null;
};

export { Controller };
