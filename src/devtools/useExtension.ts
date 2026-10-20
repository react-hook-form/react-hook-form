import React from 'react';
import type { Control, FieldValues } from 'react-hook-form';
import { get, useFormState, useWatch } from 'react-hook-form';

const SOURCE = 'react-hook-form-bridge';

export function useExtension<T extends FieldValues>(
  id: string,
  control: Control<T>,
) {
  const [enabled, setEnabled] = React.useState(false);
  const values = useWatch({ control, disabled: !enabled });
  const { errors, dirtyFields, touchedFields, ...formState } = useFormState({
    control,
    disabled: !enabled,
  });

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.source === window &&
        event.origin === window.location.origin &&
        event.data?.source === SOURCE &&
        event.data.type === 'INIT'
      ) {
        window.postMessage(
          { source: SOURCE, type: 'WELCOME' },
          window.location.origin,
        );
        setEnabled(true);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    const names = [...control._names.mount];
    const flatten = (object: object, fn: (value: any) => any) =>
      Object.fromEntries(names.map((name) => [name, fn(get(object, name))]));

    window.postMessage(
      {
        source: SOURCE,
        type: 'UPDATE',
        payload: {
          id,
          data: {
            formValues: flatten(values, (value) => value ?? ''),
            formState: {
              ...formState,
              errors: flatten(errors, (error) => ({
                type: error?.type,
                message: error?.message,
              })),
              dirtyFields: flatten(dirtyFields, (value) => !!value),
              touchedFields: flatten(touchedFields, (value) => !!value),
              nativeFields: flatten(
                control._fields,
                (field) => field?._f?.ref?.type,
              ),
            },
          },
        },
      },
      window.location.origin,
    );
  });
}
