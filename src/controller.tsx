import { ControllerProps, FieldPath, FieldValues } from './types';
import { useController } from './useController';

/**
 * Component based on `useController` hook to work with controlled component.
 *
 * @summary
 * [API](https://react-hook-form.com/api/usecontroller/controller) • [Demo](https://codesandbox.io/s/react-hook-form-v6-controller-ts-jwyzw) • [Video](https://www.youtube.com/watch?v=N2UNk_UCVyA)
 *
 * @param props - field name and the path to the form field value, and validation rules.
 *
 * @return provide field handler functions, and form state.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { control } = useForm<FormValues>();
 *
 *   return (
 *     <form>
 *       <Controller
 *         control={control}
 *         name="ReactDatepicker"
 *         render={({ field: { onChange, onBlur, value, ref }, formState, fieldState }) => (
 *           <>
 *             <input
 *               onChange={onChange} // send value to hook form
 *               onBlur={onBlur} // notify when input is touched/blur
 *               value={value} // update value
 *               ref={ref} // set ref for focus management
 *             />
 *             <p>{formState.isSubmitted ? "submitted" : ""}</p>
 *             <p>{fieldState.isTouched ? "touched" : ""}</p>
 *           </>
 *         )}
 *       />
 *     </form>
 *   );
 * }
 * ```
 */
const Controller = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: ControllerProps<TFieldValues, TName>,
) => props.render(useController<TFieldValues, TName>(props));

export { Controller };
