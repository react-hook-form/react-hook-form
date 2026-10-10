import type React from 'react';

import type {
  ControllerFieldState,
  ControllerRenderProps,
  UseControllerProps,
} from './controller';
import type { ErrorOption, FieldError, FieldErrors } from './errors';
import type { EventType } from './events';
import type { UseFieldArrayProps, UseFieldArrayReturn } from './fieldArray';
import type { FieldValues } from './fields';
import type {
  Control,
  FormState,
  ResetFieldConfig,
  SetFocusOptions,
  TriggerConfig,
  UseFormClearErrors,
  UseFormGetErrors,
  UseFormGetFieldState,
  UseFormGetValues,
  UseFormRegister,
  UseFormRegisterReturn,
  UseFormResetField,
  UseFormSetError,
  UseFormSetFocus,
  UseFormSetValue,
  UseFormSetValues,
  UseFormSubscribe,
  UseFormTrigger,
  UseFormUnregister,
  UseFormWatch,
} from './form';
import type {
  FieldArrayPath,
  FieldPath,
  FieldPathValue,
  Path,
  PathValue,
} from './path';
import type { BrowserNativeObject, IsAny } from './utils';
import type { RegisterOptions } from './validator';

declare const SELECTION_LEAF: unique symbol;

/**
 * Whether a selected value is a leaf: a primitive, a browser native object or
 * an array. Leaf selections have no relative field names of their own.
 */
export type IsSelectionLeaf<T> =
  IsAny<T> extends true
    ? false
    : [NonNullable<T>] extends [BrowserNativeObject]
      ? true
      : [NonNullable<T>] extends [ReadonlyArray<any>]
        ? true
        : [NonNullable<T>] extends [FieldValues]
          ? false
          : true;

/**
 * Field values seen by a leaf selection's `control`. The selected value lives
 * under the empty name, so `name` can be omitted when the control is passed to
 * `useController`, `Controller`, `useWatch`, `useFormState` or `useFieldArray`.
 */
export type SelectionLeafValues<T> = { '': T };

/**
 * Field values seen by a selection's `control`.
 */
export type SelectionValues<T> =
  IsSelectionLeaf<T> extends true
    ? SelectionLeafValues<T>
    : Extract<NonNullable<T>, FieldValues>;

export type SelectionLeafName<T> = Extract<
  '',
  FieldPath<SelectionLeafValues<T>>
>;

/**
 * `control` of a leaf selection.
 */
export type SelectionLeafControl<T, TContext = any> = Control<
  SelectionLeafValues<T>,
  TContext
> & {
  readonly [SELECTION_LEAF]: T;
};

/**
 * Form state of a leaf selection. Field maps (`errors`, `dirtyFields`,
 * `touchedFields`, `validatingFields`) are only available on object
 * selections; use `getFieldState()` or `fieldState` for a leaf.
 */
export type SelectionLeafFormState<T> = Omit<
  FormState<SelectionLeafValues<T>>,
  | 'errors'
  | 'dirtyFields'
  | 'touchedFields'
  | 'validatingFields'
  | 'defaultValues'
> & {
  defaultValues?: Readonly<T>;
};

export type SelectionPath<T> = [NonNullable<T>] extends [ReadonlyArray<any>]
  ? Path<NonNullable<T>> | number
  : IsSelectionLeaf<T> extends true
    ? never
    : FieldPath<SelectionValues<T>>;

export type SelectionPathValue<T, P> = P extends number
  ? NonNullable<T> extends ReadonlyArray<infer U>
    ? U
    : never
  : P extends Path<NonNullable<T>>
    ? PathValue<NonNullable<T>, P>
    : never;

export type SelectionFieldState = {
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
  error?: FieldError;
};

export type SelectionSelect<T, TContext> = <P extends SelectionPath<T>>(
  path: P,
) => FormSelection<SelectionPathValue<T, P>, TContext>;

export type SelectionShared<T, TContext> = {
  /**
   * Full path of the selection. An empty string for the root selection.
   */
  readonly name: string;
  /**
   * Select a nested path, relative to this selection.
   */
  select: SelectionSelect<T, TContext>;
};

/**
 * A selection of an object value. Its methods take field names relative to
 * the selection and share the state and subscriptions of the form.
 */
export type ObjectSelection<
  TFieldValues extends FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = SelectionShared<TFieldValues, TContext> & {
  control: Control<TFieldValues, TContext, TTransformedValues>;
  readonly formState: FormState<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  unregister: UseFormUnregister<TFieldValues>;
  watch: UseFormWatch<TFieldValues>;
  getValues: UseFormGetValues<TFieldValues>;
  getErrors: UseFormGetErrors<TFieldValues>;
  getFieldState: UseFormGetFieldState<TFieldValues>;
  setError: UseFormSetError<TFieldValues>;
  clearErrors: UseFormClearErrors<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  setValues: UseFormSetValues<TFieldValues>;
  trigger: UseFormTrigger<TFieldValues>;
  resetField: UseFormResetField<TFieldValues>;
  setFocus: UseFormSetFocus<TFieldValues>;
  subscribe: UseFormSubscribe<TFieldValues>;
};

/**
 * A selection of a leaf value (primitive, browser native object or array).
 * Its methods act on the selected value itself.
 */
export type LeafSelection<T, TContext = any> = SelectionShared<T, TContext> & {
  control: SelectionLeafControl<T, TContext>;
  readonly formState: SelectionLeafFormState<T>;
  register: (
    options?: RegisterOptions<SelectionLeafValues<T>, SelectionLeafName<T>>,
  ) => UseFormRegisterReturn<string>;
  unregister: (options?: Parameters<UseFormUnregister<FieldValues>>[1]) => void;
  watch: {
    (): T;
    (callback: (value: T, info: { name?: string; type?: EventType }) => void): {
      unsubscribe: () => void;
    };
  };
  getValues: () => T;
  getErrors: () => FieldErrors<SelectionLeafValues<T>>[''];
  getFieldState: () => SelectionFieldState;
  setError: (error: ErrorOption, options?: { shouldFocus: boolean }) => void;
  clearErrors: () => void;
  trigger: (options?: TriggerConfig) => Promise<boolean>;
  resetField: (
    options?: ResetFieldConfig<SelectionLeafValues<T>, SelectionLeafName<T>>,
  ) => void;
  setFocus: (options?: SetFocusOptions) => void;
};

/**
 * A selection returned by `form.select()`.
 *
 * @example
 * ```tsx
 * const user = form.select('user');
 * user.register('firstName');
 * ```
 */
export type FormSelection<
  T,
  TContext = any,
  TTransformedValues = SelectionValues<T>,
> =
  IsSelectionLeaf<T> extends true
    ? LeafSelection<T, TContext>
    : ObjectSelection<SelectionValues<T>, TContext, TTransformedValues>;

export type UseFormSelect<
  TFieldValues extends FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = {
  /**
   * Select the whole form.
   */
  (): ObjectSelection<TFieldValues, TContext, TTransformedValues>;
  /**
   * Select a path of the form. The same path always returns the same
   * selection.
   */
  <TFieldName extends FieldPath<TFieldValues>>(
    name: TFieldName,
  ): FormSelection<FieldPathValue<TFieldValues, TFieldName>, TContext>;
};

export type SelectionLeafControllerProps<T> = Omit<
  UseControllerProps<SelectionLeafValues<T>, SelectionLeafName<T>>,
  'name' | 'control'
> & {
  control: SelectionLeafControl<T>;
  name?: '';
};

export type SelectionLeafControllerReturn<T> = {
  field: Omit<
    ControllerRenderProps<SelectionLeafValues<T>, SelectionLeafName<T>>,
    'name'
  > & {
    name: string;
  };
  fieldState: ControllerFieldState;
  formState: SelectionLeafFormState<T>;
};

export type SelectionLeafControllerRenderProps<T> =
  SelectionLeafControllerProps<T> & {
    render: (props: SelectionLeafControllerReturn<T>) => React.ReactElement;
  };

export type SelectionLeafArrayName<T> = Extract<
  '',
  FieldArrayPath<SelectionLeafValues<T>>
>;

export type SelectionLeafFieldArrayProps<
  T,
  TKeyName extends string = 'id',
> = Omit<
  UseFieldArrayProps<
    SelectionLeafValues<T>,
    SelectionLeafArrayName<T>,
    TKeyName
  >,
  'name' | 'control'
> & {
  control: SelectionLeafControl<T>;
  name?: '';
};

export type SelectionLeafFieldArrayReturn<
  T,
  TKeyName extends string = 'id',
> = UseFieldArrayReturn<
  SelectionLeafValues<T>,
  SelectionLeafArrayName<T>,
  TKeyName
>;

export type SelectionLeafFieldArrayRenderProps<
  T,
  TKeyName extends string = 'id',
> = SelectionLeafFieldArrayProps<T, TKeyName> & {
  render: (
    fieldArray: SelectionLeafFieldArrayReturn<T, TKeyName>,
  ) => React.ReactElement;
};
