import React from 'react';

import { createFormControl } from './logic/createFormControl';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import isEmptyObject from './utils/isEmptyObject';
import isUndefined from './utils/isUndefined';
import omit from './utils/omit';
import {
  FieldErrors,
  FieldNamesMarkedBoolean,
  FieldValues,
  UseFormProps,
  UseFormReturn,
} from './types';
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
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<FieldErrors<TFieldValues>>(
    {} as FieldErrors<TFieldValues>,
  );
  const [isValid, setIsValid] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = React.useState(false);
  const [submitCount, setSubmitCount] = React.useState(0);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(false);
  const [dirtyFields, setDirtyFields] = React.useState<
    FieldNamesMarkedBoolean<TFieldValues>
  >({} as FieldNamesMarkedBoolean<TFieldValues>);
  const [touchedFields, setTouchedFields] = React.useState<
    FieldNamesMarkedBoolean<TFieldValues>
  >({} as FieldNamesMarkedBoolean<TFieldValues>);
  const formState = {
    isSubmitted,
    errors,
    isValid,
    isSubmitting,
    isSubmitSuccessful,
    submitCount,
    isDirty,
    isValidating,
    dirtyFields,
    touchedFields,
  };
  const [, updateState] = React.useState({});

  if (_formControl.current) {
    _formControl.current.control._options = props;
  } else {
    _formControl.current = {
      ...createFormControl(props),
      formState,
    };
  }

  const control = _formControl.current.control;

  useSubscribe({
    subject: control._subjects.state,
    callback: (value) => {
      if (shouldRenderFormState(value, control._proxyFormState, true)) {
        const formState = omit(value as Record<string, any>, 'name');
        control._formState = {
          ...control._formState,
          ...value,
        };

        if (formState) {
          if (isEmptyObject(formState)) {
            setIsSubmitted(control._formState.isSubmitted);
            setIsSubmitting(control._formState.isSubmitting);
            setIsSubmitSuccessful(control._formState.isSubmitSuccessful);
            setSubmitCount(control._formState.submitCount);
            setIsValidating(control._formState.isValidating);
            setErrors(control._formState.errors);
            setIsValid(control._formState.isValid);
            setIsDirty(control._formState.isDirty);
            setDirtyFields(control._formState.dirtyFields);
            setTouchedFields(control._formState.touchedFields);
          } else {
            !isUndefined(value.isSubmitted) &&
              setIsSubmitted(value.isSubmitted);
            !isUndefined(value.isSubmitting) &&
              setIsSubmitting(value.isSubmitting);
            !isUndefined(value.isSubmitSuccessful) &&
              setIsSubmitSuccessful(value.isSubmitSuccessful);
            !isUndefined(value.submitCount) &&
              setSubmitCount(value.submitCount);
            !isUndefined(value.isValidating) &&
              setIsValidating(value.isValidating);
            !isUndefined(value.errors) && setErrors({ ...value.errors });
            !isUndefined(value.isValid) && setIsValid(value.isValid);
            !isUndefined(value.isDirty) && setIsDirty(value.isDirty);
            !isUndefined(value.dirtyFields) &&
              setDirtyFields(value.dirtyFields);
            !isUndefined(value.touchedFields) &&
              setTouchedFields(value.touchedFields);
          }

          if (isEmptyObject(formState) || value.name) {
            updateState({});
          }
        }
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
    control._removeUnmounted();
  });

  _formControl.current.formState = getProxyFormState(
    formState,
    control._proxyFormState,
  );

  return _formControl.current;
}
