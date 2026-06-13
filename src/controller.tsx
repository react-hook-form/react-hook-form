import type { ControllerProps, FieldPath, FieldValues } from './types';
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
const Controller = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(
  props: ControllerProps<TFieldValues, TName, TTransformedValues>,
) =>
  props.render(useController<TFieldValues, TName, TTransformedValues>(props));

export { Controller };
