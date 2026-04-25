import { VALIDATION_MODE } from '../constants';
import type { Control, FieldValues, FormState, ReadFormState } from '../types';

export default <
  TFieldValues extends FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>(
  formState: FormState<TFieldValues>,
  control: Control<TFieldValues, TContext, TTransformedValues>,
  localProxyFormState?: ReadFormState,
  isRoot = true,
) => {
  const result = {} as typeof formState;

  for (const key in formState) {
    Object.defineProperty(result, key, {
      get: () => {
        const _key = key as keyof FormState<TFieldValues> & keyof ReadFormState;

        if (control._proxyFormState[_key] !== VALIDATION_MODE.all) {
          control._proxyFormState[_key] = !isRoot || VALIDATION_MODE.all;
        }

        localProxyFormState && (localProxyFormState[_key] = true);
        return formState[_key];
      },
    });
  }

  if (!('defaultValues' in formState)) {
    Object.defineProperty(result, 'defaultValues', {
      get: () => {
        if (control._proxyFormState.defaultValues !== VALIDATION_MODE.all) {
          control._proxyFormState.defaultValues =
            !isRoot || VALIDATION_MODE.all;
        }

        localProxyFormState && (localProxyFormState.defaultValues = true);
        return control._defaultValues;
      },
    });
  }

  return result;
};
