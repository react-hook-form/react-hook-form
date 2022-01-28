import { VALIDATION_MODE } from '../constants';
import { FormState, ReadFormState } from '../types';

export default <TFieldValues>(
  formState: FormState<TFieldValues>,
  _proxyFormState: ReadFormState,
  localProxyFormState?: ReadFormState,
  isRoot = true,
) => {
  const result = {} as typeof formState;

  for (const key in formState) {
    Object.defineProperty(result, key, {
      get: () => {
        const _key = key as keyof FormState<TFieldValues> & keyof ReadFormState;

        if (_proxyFormState[_key] !== VALIDATION_MODE.all) {
          _proxyFormState[_key] = !isRoot || VALIDATION_MODE.all;
        }

        localProxyFormState && (localProxyFormState[_key] = true);
        return formState[_key];
      },
    });
  }

  return result;
};
