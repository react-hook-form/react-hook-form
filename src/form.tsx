import * as React from 'react';

import { Control, FieldValues, SubmitHandler } from './types';

type Props<T extends FieldValues> = {
  control: Control<T>;
  children: React.ReactNode | React.ReactNode[];
  onSubmit: SubmitHandler<T>;
};

export function Form<T extends FieldValues>({
  control,
  onSubmit,
  children,
}: Props<T>) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <form onSubmit={control.handleSubmit(onSubmit)} noValidate={mounted}>
      {children}
    </form>
  );
}
