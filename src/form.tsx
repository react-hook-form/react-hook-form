import * as React from 'react';

import get from './utils/get';
import { Control, FieldValues, FormSubmitHandler } from './types';
import { useFormContext } from './useFormContext';

export type FormProps<
  TFieldValues extends FieldValues,
  TTransformedValues extends FieldValues | undefined = undefined,
> = Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onError'> &
  Partial<{
    control: Control<TFieldValues>;
    headers: Record<string, string>;
    validateStatus: (status: number) => boolean;
    onError: ({
      response,
      error,
    }:
      | {
          response: Response;
          error?: undefined;
        }
      | {
          response?: undefined;
          error: unknown;
        }) => void;
    onSuccess: ({ response }: { response: Response }) => void;
    onSubmit: TTransformedValues extends FieldValues
      ? FormSubmitHandler<TTransformedValues>
      : FormSubmitHandler<TFieldValues>;
    method: 'post' | 'put' | 'delete';
    children: React.ReactNode | React.ReactNode[];
    render: (props: {
      submit: (e?: React.FormEvent) => void;
    }) => React.ReactNode | React.ReactNode[];
    encType:
      | 'application/x-www-form-urlencoded'
      | 'multipart/form-data'
      | 'text/plain'
      | 'application/json';
  }>;

const POST_REQUEST = 'post';

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
export function Form<
  T extends FieldValues,
  U extends FieldValues | undefined = undefined,
>(props: FormProps<T, U>) {
  const methods = useFormContext<T>();
  const [mounted, setMounted] = React.useState(false);
  const {
    control = methods.control,
    onSubmit,
    children,
    action,
    method = POST_REQUEST,
    headers,
    encType,
    onError,
    render,
    onSuccess,
    validateStatus,
    ...rest
  } = props;

  const submit = async (event?: React.BaseSyntheticEvent) => {
    let hasError = false;
    let type = '';

    await control.handleSubmit(async (data) => {
      const formData = new FormData();
      let formDataJson = '';

      try {
        formDataJson = JSON.stringify(data);
      } catch {}

      for (const name of control._names.mount) {
        formData.append(name, get(data, name));
      }

      if (onSubmit) {
        onSubmit({
          data,
          event,
          method,
          formData,
          formDataJson,
        });
      }

      if (action) {
        try {
          const shouldStringifySubmissionData = [
            headers && headers['Content-Type'],
            encType,
          ].includes('json');

          const response = await fetch(action, {
            method,
            headers: {
              ...headers,
              ...(encType ? { 'Content-Type': encType } : {}),
            },
            body: shouldStringifySubmissionData ? formDataJson : formData,
          });

          if (
            response &&
            (validateStatus
              ? !validateStatus(response.status)
              : response.status < 200 || response.status >= 300)
          ) {
            hasError = true;
            onError && onError({ response });
            type = String(response.status);
          } else {
            onSuccess && onSuccess({ response });
          }
        } catch (error: unknown) {
          hasError = true;
          onError && onError({ error });
        }
      }
    })(event);

    if (hasError && props.control) {
      props.control._subjects.state.next({
        isSubmitSuccessful: false,
      });
      props.control.setError('root.server', {
        type,
      });
    }
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return render ? (
    <>
      {render({
        submit,
      })}
    </>
  ) : (
    <form
      noValidate={mounted}
      action={action}
      method={method}
      encType={encType}
      onSubmit={submit}
      {...rest}
    >
      {children}
    </form>
  );
}
