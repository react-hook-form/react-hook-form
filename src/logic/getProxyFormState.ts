import * as React from 'react';
import { FormState, FormStateProxy, ReadFormState } from '../types';

export default <TFieldValues>(
  isProxyEnabled: boolean,
  formState: FormState<TFieldValues>,
  readFormStateRef: React.MutableRefObject<ReadFormState>,
) =>
  isProxyEnabled
    ? new Proxy(formState, {
        get: (obj, prop: keyof FormStateProxy) => {
          if (prop in obj) {
            readFormStateRef.current[prop] = true;
            return obj[prop];
          }

          return undefined;
        },
      })
    : formState;
