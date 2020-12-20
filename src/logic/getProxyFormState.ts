import * as React from 'react';
import { FormStateProxy, ReadFormState } from '../types';

export default (
  isProxyEnabled: boolean,
  formState: FormStateProxy,
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
