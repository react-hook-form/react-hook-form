import * as React from 'react';
import { FormState, FormStateProxy, ReadFormState } from '../types';
import { VALIDATION_MODE } from '../constants';

export default <TFieldValues>(
  isProxyEnabled: boolean,
  formState: FormState<TFieldValues>,
  readFormStateRef: React.MutableRefObject<ReadFormState>,
  isRoot?: boolean,
) =>
  isProxyEnabled
    ? new Proxy(formState, {
        get: (obj, prop: keyof FormStateProxy) => {
          if (prop in obj) {
            readFormStateRef.current[prop] = isRoot
              ? VALIDATION_MODE.all
              : true;
            return obj[prop];
          }

          return undefined;
        },
      })
    : formState;
