import * as React from 'react';

import { Control, FieldValues, SubmitHandler } from './types';
import { useFormContext } from './useFormContext';

type Props<
  T extends FieldValues,
  U extends FieldValues | undefined = undefined,
> = {
  control?: Control<T>;
  children?: React.ReactNode | React.ReactNode[];
  onSubmit?: U extends FieldValues ? SubmitHandler<U> : SubmitHandler<T>;
};

export function Form<
  T extends FieldValues,
  U extends FieldValues | undefined = undefined,
>(props: Props<T, U>) {
  const methods = useFormContext<T>();
  const { control = methods.control, onSubmit, children } = props;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <form
      onSubmit={onSubmit ? control.handleSubmit(onSubmit) : undefined}
      noValidate={mounted}
    >
      {children}
    </form>
  );
}
