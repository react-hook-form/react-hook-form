import * as React from 'react';

import { VALIDATION_MODE } from '../constants';
import { FormState, FormStateProxy, ReadFormState } from '../types';

export default <TFieldValues>(
  isProxyEnabled: boolean,
  formState: FormState<TFieldValues>,
  _proxyFormState: ReadFormState,
  localReadFormStateRef?: React.MutableRefObject<ReadFormState>,
  isRoot = true,
) =>
  isProxyEnabled
    ? new Proxy(formState, {
        get: (obj, prop: keyof FormStateProxy) => {
          if (prop in obj) {
            if (_proxyFormState[prop] !== VALIDATION_MODE.all) {
              _proxyFormState[prop] = isRoot ? VALIDATION_MODE.all : true;
            }
            localReadFormStateRef &&
              (localReadFormStateRef.current[prop] = true);
            return obj[prop];
          }

          return undefined;
        },
      })
    : formState;
