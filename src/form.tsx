import * as React from 'react';

type Props = {
  children: React.ReactNode | React.ReactNode[];
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
};

export function Form({ onSubmit, children }: Props) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <form onSubmit={onSubmit} noValidate={mounted}>
      {children}
    </form>
  );
}
