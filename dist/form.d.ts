import React from 'react';
import { FieldValues, FormProps } from './types';
/**
 * Form component to manage submission.
 *
 * @param props - to setup submission detail. {@link FormProps}
 *
 * @returns form component or headless render prop.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { control, formState: { errors } } = useForm();
 *
 *   return (
 *     <Form action="/api" control={control}>
 *       <input {...register("name")} />
 *       <p>{errors?.root?.server && 'Server error'}</p>
 *       <button>Submit</button>
 *     </Form>
 *   );
 * }
 * ```
 */
declare function Form<T extends FieldValues, U extends FieldValues | undefined = undefined>(props: FormProps<T, U>): React.JSX.Element;
export { Form };
//# sourceMappingURL=form.d.ts.map