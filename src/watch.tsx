import type {
  FieldPath,
  FieldValues,
  WatchProps,
  WatchRenderValue,
} from './types';
import { useWatch } from './useWatch';

/**
 * Component wrapper around `useWatch`. Re-renders only when watched fields change.
 *
 * @see [API](https://react-hook-form.com/docs/usewatch)
 *
 * @example
 * ```tsx
 * <Watch
 *   control={control}
 *   names={["foo", "bar"]}
 *   render={([foo, bar]) => <span>{foo} {bar}</span>}
 * />
 * ```
 */
export const Watch = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends
    | FieldPath<TFieldValues>
    | readonly [FieldPath<TFieldValues>, ...FieldPath<TFieldValues>[]]
    | FieldPath<TFieldValues>[]
    | readonly FieldPath<TFieldValues>[]
    | undefined = undefined,
  TContext = any,
  TTransformedValues = TFieldValues,
  TComputeValue = undefined,
>(
  props: WatchProps<
    TFieldName,
    TFieldValues,
    TContext,
    TTransformedValues,
    TComputeValue
  >,
) =>
  props.render(
    useWatch({ name: props.names, ...(props as any) }) as WatchRenderValue<
      TFieldName,
      TFieldValues,
      TComputeValue
    >,
  );
