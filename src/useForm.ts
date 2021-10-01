import * as React from 'react';

import { createFormControl } from './logic/createFormControl';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import { FieldValues, FormState, UseFormProps, UseFormReturn } from './types';
import { useSubscribe } from './useSubscribe';

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
>(
  props: UseFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues, TContext> {
  const _formControl = React.useRef<
    UseFormReturn<TFieldValues, TContext> | undefined
  >();
  const rerender = React.useReducer(() => ({}), {})[1];

  if (_formControl.current) {
    _formControl.current.control._updateProps(props);
  } else {
    _formControl.current = {
      ...createFormControl(props),
      formState: {} as FormState<TFieldValues>,
    };
  }

  const control = _formControl.current.control;

  useSubscribe({
    subject: control._subjects.state,
    callback: (formState) => {
      if (shouldRenderFormState(formState, control._proxyFormState, true)) {
        control._formState = {
          ...control._formState,
          ...formState,
        };

        rerender();
      }
    },
  });

  React.useEffect(() => {
    if (!control._stateFlags.mount) {
      control._proxyFormState.isValid && control._updateValid();
      control._stateFlags.mount = true;
    }
    if (control._stateFlags.watch) {
      control._stateFlags.watch = false;
      control._subjects.state.next({});
    }
    control._removeFields();
  });

  _formControl.current.formState = getProxyFormState(
    control._formState,
    control._proxyFormState,
  );

  return _formControl.current;
}
