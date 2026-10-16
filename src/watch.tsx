import isUndefined from './utils/isUndefined';
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
) => {
  const watch = useWatch as (
    options: Omit<typeof props, 'names' | 'render'>,
  ) => WatchRenderValue<TFieldName, TFieldValues, TComputeValue>;

  return props.render(
    watch({
      control: props.control,
      name: isUndefined(props.name) ? props.names : props.name,
      disabled: props.disabled,
      exact: props.exact,
      defaultValue: props.defaultValue,
      compute: props.compute,
    }),
  );
};
