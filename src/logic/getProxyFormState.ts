import { VALIDATION_MODE } from '../constants';
import { FormState, FormStateProxy, ReadFormState } from '../types';

export default <TFieldValues>(
  formState: FormState<TFieldValues>,
  _proxyFormState: ReadFormState,
  localReadFormStateRef?: React.MutableRefObject<ReadFormState>,
  isRoot = true,
) => {
  function createGetter(prop: keyof FormStateProxy) {
    return () => {
      if (prop in formState) {
        if (_proxyFormState[prop] !== VALIDATION_MODE.all) {
          _proxyFormState[prop] = !isRoot || VALIDATION_MODE.all;
        }
        localReadFormStateRef && (localReadFormStateRef.current[prop] = true);
        return formState[prop];
      }
      return undefined;
    };
  }

  const result = {} as any as typeof formState;
  for (const key in formState) {
    Object.defineProperty(result, key, {
      get: createGetter(key as keyof FormStateProxy),
    });
  }

  return result;
};
