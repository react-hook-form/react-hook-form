import { type ReactNode } from 'react';

import type { Control, FieldPath, FieldPathValue, FieldValues } from './types';
import { useWatch } from './useWatch';

type GetValues<
  TFieldValues extends FieldValues,
  TFieldNames extends readonly FieldPath<TFieldValues>[] = readonly [],
> = TFieldNames extends readonly [
  infer Name extends FieldPath<TFieldValues>,
  ...infer RestFieldNames,
]
  ? RestFieldNames extends readonly FieldPath<TFieldValues>[]
    ? readonly [
        FieldPathValue<TFieldValues, Name>,
        ...GetValues<TFieldValues, RestFieldNames>,
      ]
    : never
  : TFieldNames extends readonly [infer Name extends FieldPath<TFieldValues>]
    ? readonly [FieldPathValue<TFieldValues, Name>]
    : TFieldNames extends readonly []
      ? readonly []
      : never;

/**
 * Watch component that subscribes to form field changes and re-renders when watched fields update.
 *
 * @param control - The form control object from useForm
 * @param names - Array of field names to watch for changes
 * @param children - Either a ReactNode to render or a function that receives watched values and returns ReactNode
 * @returns The rendered children, either directly or as the result of calling children function with watched values
 *
 * @example
 * The `Watch` component's children only re-render when the values of `foo`, `bar`, and `baz.qux` change.
 * The types of `foo`, `bar`, and `baz.qux` are precisely inferred.
 *
 * ```tsx
 * const { control } = useForm();
 *
 * <Watch control={control} names={['foo', 'bar', 'baz.qux']}>
 *   {([foo, bar, baz_qux]) => <div>{foo}{bar}{baz_qux}</div>}
 * </Watch>
 * ```
 */
export const Watch = <
  const TFieldNames extends readonly FieldPath<TFieldValues>[],
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>({
  control,
  names,
  children,
}: {
  control: Control<TFieldValues, TContext, TTransformedValues>;
  names: TFieldNames;
  children?:
    | ReactNode
    | ((values: GetValues<TFieldValues, TFieldNames>) => ReactNode);
}) => {
  const values = useWatch({ control, name: names });

  return typeof children === 'function'
    ? children(values as GetValues<TFieldValues, TFieldNames>)
    : children;
};
