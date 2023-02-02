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
  }: {
    response?: Response;
    error?: unknown;
  }) => void;
  headers: Record<string, string>;
  validateStatus: (status: number) => boolean;
}> &
  React.FormHTMLAttributes<HTMLFormElement>;

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
    method,
    headers,
    onError,
    render,
    onSuccess,
    validateStatus,
    ...rest
  } = props;

  const submit = control.handleSubmit(async (data) => {
    onSubmit && onSubmit(data);

    if (action) {
      const formData = new FormData();
      let includeJsonHeader = false;

      if (headers) {
        includeJsonHeader = headers['Content-Type'].includes('json');
      } else {
        control._names.mount.forEach((name) => {
          formData.append(name, get(data, name));
        });
      }

      try {
        const response = await fetch(action, {
          method: method || 'post',
          headers,
          body: includeJsonHeader ? JSON.stringify(data) : formData,
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
    render({
      submit,
    })
  ) : (
    <form
      noValidate={mounted}
      action={action}
      method={method}
      onSubmit={submit}
      {...rest}
    >
      {children}
    </form>
  );
}
