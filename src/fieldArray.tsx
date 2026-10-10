import type React from 'react';

import type {
  FieldArray as FieldArrayType,
  FieldArrayPath,
  FieldArrayProps,
  FieldValues,
  SelectionLeafFieldArrayRenderProps,
} from './types';
import { useFieldArray } from './useFieldArray';

type FieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> =
    FieldArrayPath<TFieldValues>,
> = FieldArrayType<TFieldValues, TFieldArrayName>;

/**
 * Component based on `useFieldArray` hook to work with controlled component.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { control, register } = useForm<FormValues>({
 *     defaultValues: {
 *       test: [
 *         {
 *           value: '',
 *         },
 *       ],
 *     },
 *   });
 *
 *   return (
 *     <form>
 *       <FieldArray
 *         control={control}
 *         name="test"
 *         render={({ fields }) =>
 *           fields.map((field, index) => (
 *             <input key={field.id} {...register(`test.${index}.value`)} />
 *           ))
 *         }
 *       />
 *     </form>
 *   );
 * }
 * ```
 */
function FieldArray<T, TKeyName extends string = 'id'>(
  props: SelectionLeafFieldArrayRenderProps<T, TKeyName>,
): React.ReactElement;
/**
 * Component based on `useFieldArray` hook to work with controlled component.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { control, register } = useForm<FormValues>({
 *     defaultValues: {
 *       test: [
 *         {
 *           value: '',
 *         },
 *       ],
 *     },
 *   });
 *
 *   return (
 *     <form>
 *       <FieldArray
 *         control={control}
 *         name="test"
 *         render={({ fields }) =>
 *           fields.map((field, index) => (
 *             <input key={field.id} {...register(`test.${index}.value`)} />
 *           ))
 *         }
 *       />
 *     </form>
 *   );
 * }
 * ```
 */
function FieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>(props: FieldArrayProps<TFieldValues, TName, TKeyName>): React.ReactElement;
function FieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>(
  props:
    | FieldArrayProps<TFieldValues, TName, TKeyName>
    | SelectionLeafFieldArrayRenderProps<any, TKeyName>,
) {
  return props.render(
    useFieldArray<TFieldValues, TName, TKeyName>(
      props as FieldArrayProps<TFieldValues, TName, TKeyName>,
    ) as never,
  );
}

export { FieldArray };
