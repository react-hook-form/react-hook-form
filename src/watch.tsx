import type { ReactNode } from 'react';

import type {
  Control,
  DeepPartialSkipArrayKey,
  FieldPath,
  FieldPathValue,
  FieldPathValues,
  FieldValues,
} from './types';
import { useWatch } from './useWatch';

type WatchDefaultValue<
  TFieldName,
  TFieldValues extends FieldValues = FieldValues,
> =
  TFieldName extends FieldPath<TFieldValues>
    ? FieldPathValue<TFieldValues, TFieldName>
    : DeepPartialSkipArrayKey<TFieldValues>;

type WatchValue<
  TFieldName,
  TFieldValues extends FieldValues = FieldValues,
> = TFieldName extends
  | FieldPath<TFieldValues>[]
  | readonly FieldPath<TFieldValues>[]
  ? FieldPathValues<TFieldValues, TFieldName>
  : TFieldName extends FieldPath<TFieldValues>
    ? FieldPathValue<TFieldValues, TFieldName>
    : TFieldValues;

type WatchRenderValue<
  TFieldName,
  TFieldValues extends FieldValues,
  TComputeValue,
> = TComputeValue extends undefined
  ? WatchValue<TFieldName, TFieldValues>
  : TComputeValue;

export type WatchProps<
  TFieldName extends
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[]
    | undefined = undefined,
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
  TComputeValue = undefined,
> = {
  control?: Control<TFieldValues, TContext, TTransformedValues>;
  /**
   * @deprecated This prop will be renamed to `name` in the next major release.
   * Use `name` instead.
   */
  names?: TFieldName;
  name?: TFieldName;
  disabled?: boolean;
  exact?: boolean;
  defaultValue?: WatchDefaultValue<TFieldName, TFieldValues>;
  compute?: (value: WatchValue<TFieldName, TFieldValues>) => TComputeValue;
  render: (
    value: WatchRenderValue<TFieldName, TFieldValues, TComputeValue>,
  ) => ReactNode;
};

/**
 * Watch component that subscribes to form field changes and re-renders when watched fields update.
 *
 * @param control - The form control object from useForm
 * @param name - Can be field name, array of field names, or undefined to watch the entire form
 * @param disabled - Disable subscription
 * @param exact - Whether to watch exact field names or not
 * @param defaultValue - The default value to use if the field is not yet set
 * @param compute - Function to compute derived values from watched fields
 * @param render - The function that receives watched values and returns ReactNode
 * @returns The result of calling render function with watched values
 *
 * @example
 * The `Watch` component only re-render when the values of `foo`, `bar`, and `baz.qux` change.
 * The types of `foo`, `bar`, and `baz.qux` are precisely inferred.
 *
 * ```tsx
 * const { control } = useForm();
 *
 * <Watch
 *   control={control}
 *   names={['foo', 'bar', 'baz.qux']}
 *   render={([foo, bar, baz_qux]) => <div>{foo}{bar}{baz_qux}</div>}
 * />
 * ```
 */
export const Watch = <
  TFieldValues extends FieldValues = FieldValues,
  const TFieldName extends
    | FieldPath<TFieldValues>
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[]
    | undefined = undefined,
  TContext = any,
  TTransformedValues = TFieldValues,
  TComputeValue = undefined,
>({
  render,
  names,
  ...props
}: WatchProps<
  TFieldName,
  TFieldValues,
  TContext,
  TTransformedValues,
  TComputeValue
>) =>
  render(
    useWatch({ ...(props as any), name: names }) as WatchRenderValue<
      TFieldName,
      TFieldValues,
      TComputeValue
    >,
  );
