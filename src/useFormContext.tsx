import React from 'react';

import omit from './utils/omit';
import {
  FieldArrayContextReturn,
  FieldValues,
  FormProviderProps,
  UseFormReturn,
} from './types';

const HookFormContext = React.createContext<UseFormReturn | null>(null);

export const useFormContext = <
  TFieldValues extends FieldValues,
>(): UseFormReturn<TFieldValues> & FieldArrayContextReturn<TFieldValues> =>
  React.useContext(HookFormContext) as unknown as UseFormReturn<TFieldValues> &
    FieldArrayContextReturn<TFieldValues>;

export const FormProvider = <
  TFieldValues extends FieldValues,
  TContext extends object = object,
>(
  props: FormProviderProps<TFieldValues, TContext>,
) => (
  <HookFormContext.Provider
    value={
      omit(props, 'children') as unknown as UseFormReturn &
        FieldArrayContextReturn<TFieldValues>
    }
  >
    {props.children}
  </HookFormContext.Provider>
);
