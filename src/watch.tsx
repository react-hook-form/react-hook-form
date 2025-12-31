import type {
  FieldPath,
  FieldValues,
  UseWatchReturn,
  WatchName,
  WatchProps,
} from './types';
import { useWatch } from './useWatch';

/**
 * Watch the component that subscribes to form field changes and re-renders when watched fields update.
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
 *   name={['foo', 'bar', 'baz.qux']}
 *   render={([foo, bar, baz_qux]) => <div>{foo}{bar}{baz_qux}</div>}
 * />
 * ```
 */
export const Watch = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends WatchName<TFieldValues> = undefined,
  TFieldNames extends readonly FieldPath<TFieldValues>[] =
    readonly FieldPath<TFieldValues>[],
  TTransformedValues = TFieldValues,
  TComputeValue = unknown,
>(
  props: WatchProps<
    TFieldValues,
    TFieldName,
    TFieldNames,
    TTransformedValues,
    TComputeValue
  >,
) =>
  props.render(
    useWatch({ name: props.names, ...props }) as UseWatchReturn<
      TFieldValues,
      TFieldName,
      TComputeValue
    >,
  );
