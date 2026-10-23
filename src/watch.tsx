import type {
  FieldValues,
  WatchName,
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
  TFieldName extends WatchName<TFieldValues> = undefined,
  TContext = any,
  TTransformedValues = TFieldValues,
  TComputeValue = undefined,
>(
  props: WatchProps<
    TFieldValues,
    TFieldName,
    TContext,
    TTransformedValues,
    TComputeValue
  >,
) =>
  props.render(
    (
      useWatch as (
        options: typeof props,
      ) => WatchRenderValue<TFieldValues, TFieldName, TComputeValue>
    )({ name: props.names, ...props }),
  );
