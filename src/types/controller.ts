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
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  isValidating: boolean;
  error?: FieldError;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  onChange: (...event: any[]) => void;
  onBlur: Noop;
  value: FieldPathValue<TFieldValues, TName>;
  disabled?: boolean;
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
  disabled?: boolean;
};

export type UseControllerReturn<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  formState: UseFormStateReturn<TFieldValues>;
  fieldState: ControllerFieldState;
};

export type RenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFieldValues>;
};

export type RenderFunction<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ({
  field,
  fieldState,
  formState,
}: RenderProps<TFieldValues, TName>) => React.ReactElement;
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
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  render: RenderFunction<TFieldValues, TName>;
} & UseControllerProps<TFieldValues, TName>;
