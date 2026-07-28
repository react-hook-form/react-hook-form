import type {
  FieldArray as FieldArrayType,
  FieldArrayPath,
  FieldArrayProps,
  FieldValues,
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
const FieldArray = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>(
  props: FieldArrayProps<TFieldValues, TName, TKeyName>,
) => props.render(useFieldArray<TFieldValues, TName, TKeyName>(props));

export { FieldArray };
