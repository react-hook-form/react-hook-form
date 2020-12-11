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
  const { field, meta } = useController(props);

  const componentProps = {
    ...rest,
    ...field,
  };

  return as
    ? React.isValidElement(as)
      ? React.cloneElement(as, componentProps)
      : React.createElement(as as NativeInputs, componentProps as any)
    : render
    ? render(field, meta)
    : null;
};

export { Controller };
