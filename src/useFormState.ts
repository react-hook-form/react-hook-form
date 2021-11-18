import * as React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import shouldSubscribeByName from './logic/shouldSubscribeByName';
import {
  FieldValues,
  InternalFieldName,
  UseFormStateProps,
  UseFormStateReturn,
} from './types';
import { useFormContext } from './useFormContext';
import { useSubscribe } from './useSubscribe';

function useFormState<TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormStateProps<TFieldValues>,
): UseFormStateReturn<TFieldValues> {
  const methods = useFormContext<TFieldValues>();
  const { control = methods.control, disabled, name, exact } = props || {};
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
    callback: (value) =>
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
    subject: control._subjects.state,
  });

  return getProxyFormState(
    formState,
    control._proxyFormState,
    _localProxyFormState.current,
    false,
  );
}

export { useFormState };
