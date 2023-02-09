import * as React from 'react';

import get from './utils/get';
import { SERVER_ERROR_TYPE } from './constants';
import { Control, FieldValues, SubmitHandler } from './types';
import { useFormContext } from './useFormContext';

type Props<
  T extends FieldValues,
  U extends FieldValues | undefined = undefined,
> = Partial<{
  control: Control<T>;
  children?: React.ReactNode | React.ReactNode[];
  render?: (props: {
    submit: (e?: React.FormEvent) => void;
  }) => React.ReactNode | React.ReactNode[];
  onSubmit: U extends FieldValues ? SubmitHandler<U> : SubmitHandler<T>;
  onSuccess: ({ response }: { response: Response }) => void;
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
  headers: Record<string, string>;
  validateStatus: (status: number) => boolean;
}> &
  Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onError'>;

const POST_REQUEST = 'post';

/**
 * Form component to manage submission.
 *
 * @param props - to setup submission detail. {@link Props}
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
 *     </form>
 *   );
 * }
 * ```
 */
export function Form<
  T extends FieldValues,
  U extends FieldValues | undefined = undefined,
>(props: Props<T, U>) {
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
  const isPostRequest = method === POST_REQUEST;

  const submit = control.handleSubmit(async (data) => {
    onSubmit && onSubmit(data);

    if (action) {
      const formData = new FormData();
      let shouldStringifySubmissionData = false;

      if (headers) {
        shouldStringifySubmissionData =
          headers['Content-Type'].includes('json');
      } else {
        control._names.mount.forEach((name) =>
          formData.append(name, get(data, name)),
        );
      }

      try {
        const response = await fetch(action, {
          method,
          headers: {
            ...headers,
            ...(encType ? { 'Content-Type': encType } : {}),
          },
          ...(isPostRequest
            ? {
                body: shouldStringifySubmissionData
                  ? JSON.stringify(data)
                  : formData,
              }
            : {}),
        });

        if (
          validateStatus
            ? !validateStatus(response.status)
            : response.status < 200 || response.status >= 300
        ) {
          control.setError(SERVER_ERROR_TYPE, {
            type: String(response.status),
          });
          onError && onError({ response });
        } else {
          onSuccess && onSuccess({ response });
        }
      } catch (error: unknown) {
        control.setError(SERVER_ERROR_TYPE, {
          type: 'error',
        });
        onError && onError({ error });
      }
    }
  });

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
