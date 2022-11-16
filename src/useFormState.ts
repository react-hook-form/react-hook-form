import React from 'react';

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

/**
 * This custom hook allows you to subscribe to each form state, and isolate the re-render at the custom hook level. It has its scope in terms of form state subscription, so it would not affect other useFormState and useForm. Using this hook can reduce the re-render impact on large and complex form application.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useformstate) • [Demo](https://codesandbox.io/s/useformstate-75xly)
 *
 * @param props - include options on specify fields to subscribe. {@link UseFormStateReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, handleSubmit, control } = useForm({
 *     defaultValues: {
 *     firstName: "firstName"
 *   }});
 *   const { dirtyFields } = useFormState({
 *     control
 *   });
 *   const onSubmit = (data) => console.log(data);
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input {...register("firstName")} placeholder="First Name" />
 *       {dirtyFields.firstName && <p>Field is dirty.</p>}
 *       <input type="submit" />
 *     </form>
 *   );
 * }
 * ```
 */
function useFormState<TFieldValues extends FieldValues = FieldValues>(
  props?: UseFormStateProps<TFieldValues>,
): UseFormStateReturn<TFieldValues> {
  const methods = useFormContext<TFieldValues>();
  const { control = methods.control, disabled, name, exact } = props || {};
  const [formState, updateFormState] = React.useState(control._formState);
  const _mounted = React.useRef(true);
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
    callback: React.useCallback(
      (value: { name?: InternalFieldName }) =>
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
    ),
    subject: control._subjects.state,
  });

  React.useEffect(() => {
    _mounted.current = true;
    const isDirty = control._proxyFormState.isDirty && control._getDirty();

    if (isDirty !== control._formState.isDirty) {
      control._subjects.state.next({
        isDirty,
      });
    }
    control._updateValid();

    return () => {
      _mounted.current = false;
    };
  }, [control]);

  return getProxyFormState(
    formState,
    control,
    _localProxyFormState.current,
    false,
  );
}

export { useFormState };
