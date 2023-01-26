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
  resolve: (response: Response) => void;
  reject: (response?: Response) => void;
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
    reject,
    resolve,
    validateStatus,
    ...rest
  } = props;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <form
      noValidate={mounted}
      action={action}
      method={method}
      onSubmit={
        onSubmit
          ? control.handleSubmit(onSubmit)
          : action
          ? (e) => {
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
                    reject && reject(response);
                  } else {
                    resolve && resolve(response);
                  }
                } catch (e: unknown) {
                  control.setError(type, {
                    type: 'error',
                    message: isObject(e) ? (e as Error).message : '',
                  });
                  reject && reject();
                }
              })(e);
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </form>
  );
}
