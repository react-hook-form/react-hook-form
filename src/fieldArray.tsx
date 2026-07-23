import type { FieldArrayPath, FieldArrayProps, FieldValues } from './types';
import { useFieldArray } from './useFieldArray';

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
>(
  props: FieldArrayProps<TFieldValues, TName>,
) => props.render(useFieldArray<TFieldValues, TName>(props));

export { FieldArray };
