import React from 'react';

import { RegisterOptions } from './validator';
import {
  Control,
  FieldError,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Noop,
  RefCallBack,
  UseFormStateReturn,
} from './';

export type ControllerFieldState = {
  /**
   * @deprecated check `fieldState.error` instead
   * ```jsx
   * {fieldState.error && <p>{fieldState.error.message}</p>}
   * ```
   */
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  error?: FieldError;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  onChange: (...event: any[]) => void;
  onBlur: Noop;
  value: FieldPathValue<TFieldValues, TName>;
  name: TName;
  ref: RefCallBack;
};

export type UseControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  shouldUnregister?: boolean;
  defaultValue?: FieldPathValue<TFieldValues, TName>;
  control?: Control<TFieldValues>;
  customProps?: Record<string, any>;
};

export type UseControllerReturn<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  formState: UseFormStateReturn<TFieldValues>;
  fieldState: ControllerFieldState;
  customProps: Record<string, any>;
};

/**
 * Render function to provide the control for the field.
 *
 * @returns all the event handler, and relevant field and form state.
 *
 * @example
 * ```tsx
 * const { field, fieldState, formState, customProps } = useController();
 *
 * <Controller
 *   render={({ field, formState, fieldState, customProps }) => ({
 *     <input
 *       onChange={field.onChange}
 *       onBlur={field.onBlur}
 *       name={field.name}
 *       ref={field.ref} // optional for focus management
 *       data-foo={customProps.foo} // optional to pass down props
 *     />
 *   })}
 * />
 * ```
 */
export type ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  render: ({
    field,
    fieldState,
    formState,
    customProps,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
    customProps: Record<string, any>;
  }) => React.ReactElement;
} & UseControllerProps<TFieldValues, TName>;
