import React from 'react';

import { RegisterOptions } from './validator';
import {
  Auto,
  Control,
  FieldError,
  FieldPathValue,
  FieldValues,
  Noop,
  PathString,
  RefCallBack,
  UseFormStateReturn,
} from './';

export type ControllerFieldState = {
  isTouched: boolean;
  isDirty: boolean;
  error?: FieldError;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues,
  TName extends PathString,
> = {
  onChange: (...event: any[]) => void;
  onBlur: Noop;
  value: FieldPathValue<TFieldValues, TName>;
  name: TName;
  ref: RefCallBack;
};

export type UseControllerProps<
  TFieldValues extends FieldValues,
  TName extends PathString,
> = {
  name: Auto.FieldPath<TFieldValues, TName>;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  shouldUnregister?: boolean;
  defaultValue?: FieldPathValue<TFieldValues, TName>;
  control?: Control<TFieldValues>;
};

export type UseControllerReturn<
  TFieldValues extends FieldValues,
  TName extends PathString,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  formState: UseFormStateReturn<TFieldValues>;
  fieldState: ControllerFieldState;
};

/**
 * Render function to provide the control for the field.
 *
 * @returns all the event handler, and relevant field and form state.
 *
 * @example
 * ```tsx
 * const { field, fieldState, formState } = useController();
 *
 * <Controller
 *   render={({ field, formState, fieldState }) => ({
 *     <input
 *       onChange={field.onChange}
 *       onBlur={field.onBlur}
 *       name={field.name}
 *       ref={field.ref} // optional for focus management
 *     />
 *   })}
 * />
 * ```
 */
export type ControllerProps<
  TFieldValues extends FieldValues,
  TName extends PathString,
> = {
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
} & UseControllerProps<TFieldValues, TName>;
