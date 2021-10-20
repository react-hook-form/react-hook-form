import * as React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import shouldSubscribeByName from './logic/shouldSubscribeByName';
import { FieldValues, UseFormStateProps, UseFormStateReturn } from './types';
import { useFormContext } from './useFormContext';
import { useSubscribe } from './useSubscribe';

function useFormState<TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormStateProps<TFieldValues>,
): UseFormStateReturn<TFieldValues> {
  const methods = useFormContext<TFieldValues>();
  const { control = methods.control, disabled, name } = props || {};
  const [formState, updateFormState] = React.useState(control._formState);
  const _localProxyFormState = React.useRef({
    isDirty: false,
    dirtyFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  });
  const _name = React.useRef(name);

  _name.current = name;

  useSubscribe({
    disabled,
    callback: (formState) =>
      shouldSubscribeByName(_name.current, formState.name) &&
      shouldRenderFormState(formState, _localProxyFormState.current) &&
      updateFormState({
        ...control._formState,
        ...formState,
      }),
    subject: control._subjects.state,
    skipEarlySubscription: true,
  });

  return getProxyFormState(
    formState,
    control._proxyFormState,
    _localProxyFormState.current,
    false,
  );
}

export { useFormState };
