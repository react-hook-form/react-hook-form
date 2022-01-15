import React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import shouldSubscribeByName from './logic/shouldSubscribeByName';
import {
  FieldValues,
  InternalFieldName,
  PathString,
  ReadFormState,
  UseFormStateProps,
  UseFormStateReturn,
} from './types';
import { useFormContext } from './useFormContext';
import { useSubscribe } from './useSubscribe';

function useFormState<
  TFieldValues extends FieldValues,
  TFieldName extends PathString,
>(
  props?: UseFormStateProps<TFieldValues, TFieldName>,
): UseFormStateReturn<TFieldValues> {
  const methods = useFormContext<TFieldValues>();
  const { control = methods.control, disabled, name, exact } = props || {};
  const [formState, updateFormState] = React.useState(control._formState);
  const _localProxyFormState = React.useRef<ReadFormState>({
    dirty: false,
    dirtyFields: false,
    touchedFields: false,
    validating: false,
    valid: false,
    errors: false,
  });
  const _name = React.useRef(name);
  const _mounted = React.useRef(true);

  _name.current = name;

  const callback = React.useCallback(
    (value) =>
      _mounted.current &&
      shouldSubscribeByName(
        _name.current as InternalFieldName,
        value.name,
        exact,
      ) &&
      shouldRenderFormState(value, _localProxyFormState.current) &&
      updateFormState({
        ...control._formState,
        ...value,
      }),
    [control, exact],
  );

  useSubscribe({
    disabled,
    callback,
    subject: control._subjects.state,
  });

  React.useEffect(
    () => () => {
      _mounted.current = false;
    },
    [],
  );

  return getProxyFormState(
    formState,
    control._proxyFormState,
    _localProxyFormState.current,
    false,
  );
}

export { useFormState };
