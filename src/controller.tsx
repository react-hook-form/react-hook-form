import type React from 'react';

import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  SelectionLeafControllerRenderProps,
} from './types';
import { useController } from './useController';

/**
 * Component wrapper around `useController` for controlled inputs.
 *
 * @see [API](https://react-hook-form.com/docs/usecontroller/controller)
 *
 * @example
 * ```tsx
 * <Controller
 *   control={control}
 *   name="test"
 *   render={({ field, fieldState, formState }) => <input {...field} />}
 * />
 * ```
 */
export function Controller<T>(
  props: SelectionLeafControllerRenderProps<T>,
): React.ReactElement;
/**
 * Component wrapper around `useController` for controlled inputs.
 *
 * @see [API](https://react-hook-form.com/docs/usecontroller/controller)
 *
 * @example
 * ```tsx
 * <Controller
 *   control={control}
 *   name="test"
 *   render={({ field, fieldState, formState }) => <input {...field} />}
 * />
 * ```
 */
export function Controller<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(
  props: ControllerProps<TFieldValues, TName, TTransformedValues>,
): React.ReactElement;
export function Controller<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(
  props:
    | ControllerProps<TFieldValues, TName, TTransformedValues>
    | SelectionLeafControllerRenderProps<any>,
) {
  return props.render(
    useController<TFieldValues, TName, TTransformedValues>(
      props as ControllerProps<TFieldValues, TName, TTransformedValues>,
    ),
  );
}
