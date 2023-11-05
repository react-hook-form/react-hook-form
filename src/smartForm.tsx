import React from 'react';

import { FieldValues, SmartFormProps } from './types';
import { useForm } from './useForm';

/**
 *  @description
 *  This component appears to be a wrapper around the useForm hook.
 *  This wrapper aims to simplify the usage of the form handling logic and provide a more structured and reusable way to manage forms in our application.
 *  We can easily use this component without using useForm hook directly.
 *  The conditional rendering of children allows us to have flexible rendering options for the content within the form,
 *  We can pass in child components directly or as a function that receives the form methods.
 *
 *  @param props - destruction it values from ~> {@link UseFormProps}
 *
 *  @returns a callback function that gives us the form methods ~> {@link UseFormReturn}
 *
 *  @example
 *  ```tsx
 *  function App() {
 *   return (
 *    <SmartForm defaultValues={{ fullName: '' }} onSubmit={(values) => console.log(values)} >
 *      {({ register }) => (
 *          <>
 *              <input {...register("fullName")} />
 *              <button>Submit</button>
 *          </>
 *      )}
 *    </SmartForm>
 *   );
 *  }
 * ```
 *
 *  @example
 *  ```tsx
 *  function App() {
 *   return (
 *    <SmartForm defaultValues={{ fullName: '' }} onSubmit={(values) => console.log(values)} >
 *      {({ control }) => (
 *          <>
 *              <Controller
 *              name='fullName'
 *              control={control}
 *              render={({ field }) => (
 *                  <input {...field} />
 *              )}
 *           />
 *          <button>Submit</button>
 *          </>
 *      )}
 *    </SmartForm>
 *   );
 *  }
 * ```
 */

const SmartForm = <T extends FieldValues>({
  children,
  onSubmit,
  ...rest
}: SmartFormProps<T>) => {
  // Initialize form methods using useForm hook with provided props
  const { handleSubmit, ...restOfMethods } = useForm<T>(rest);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {typeof children === 'function' ? children(restOfMethods) : children}
    </form>
  );
};

export { SmartForm };
