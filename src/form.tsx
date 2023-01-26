import * as React from 'react';

import isObject from './utils/isObject';
import { Control, FieldValues, SubmitHandler } from './types';
import { useFormContext } from './useFormContext';

type Props<
  T extends FieldValues,
  U extends FieldValues | undefined = undefined,
> = Partial<{
  control: Control<T>;
  children: React.ReactNode | React.ReactNode[];
  onSubmit: U extends FieldValues ? SubmitHandler<U> : SubmitHandler<T>;
  onValid: (response: Response) => void;
  onError: (response?: Response) => void;
  headers: Record<string, string>;
  validateStatus: (status: number) => boolean;
}> &
  React.FormHTMLAttributes<HTMLFormElement> &
  Required<Pick<React.FormHTMLAttributes<HTMLFormElement>, 'action'>>;

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
    noValidate,
    onValid,
    validateStatus,
  } = props;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <form
      action={action}
      method={method}
      noValidate={noValidate || mounted}
      onSubmit={
        onSubmit
          ? control.handleSubmit(onSubmit)
          : (e) => {
              e.preventDefault();
              const type = 'root.server' as const;
              control.handleSubmit(async (data) => {
                try {
                  const response = await fetch(action, {
                    method: method || 'post',
                    headers: {
                      'Content-Type': 'application/json',
                      ...headers,
                    },
                    body: JSON.stringify(data),
                  });

                  if (
                    validateStatus
                      ? !validateStatus(response.status)
                      : response.status < 200 || response.status >= 300
                  ) {
                    control.setError(type, {
                      type: String(response.status),
                    });
                    onError && onError(response);
                  } else {
                    onValid && onValid(response);
                  }
                } catch (e: unknown) {
                  control.setError(type, {
                    type: 'error',
                    message: isObject(e) ? (e as Error).message : '',
                  });
                  onError && onError();
                }
              })(e);
            }
      }
    >
      {children}
    </form>
  );
}
