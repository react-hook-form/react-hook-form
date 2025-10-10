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

export type WatchProps<
  TFieldNames extends readonly FieldPath<TFieldValues>[],
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = {
  control: Control<TFieldValues, TContext, TTransformedValues>;
  names: TFieldNames;
  render: (values: GetValues<TFieldValues, TFieldNames>) => ReactNode;
};

/**
 * Watch component that subscribes to form field changes and re-renders when watched fields update.
 *
 * @param control - The form control object from useForm
 * @param names - Array of field names to watch for changes
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
  TFieldNames extends readonly FieldPath<TFieldValues>[],
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>({
  control,
  names,
  render,
}: WatchProps<TFieldNames, TFieldValues, TContext, TTransformedValues>) =>
  render(
    useWatch({ control, name: names }) as GetValues<TFieldValues, TFieldNames>,
  );
