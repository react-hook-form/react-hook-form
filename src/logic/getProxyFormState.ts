import { VALIDATION_MODE } from '../constants';
import { Control, FieldValues, FormState, ReadFormState } from '../types';

export default <TFieldValues extends FieldValues>(
  formState: FormState<TFieldValues>,
  control: Control<TFieldValues>,
  localProxyFormState?: ReadFormState,
) => {
  const result = {
    defaultValues: control._defaultValues,
  } as typeof formState;

  for (const key in formState) {
    Object.defineProperty(result, key, {
      get: () => {
        if (
          control._proxyFormState[key as keyof ReadFormState] !==
          VALIDATION_MODE.all
        ) {
          control._proxyFormState[key as keyof ReadFormState] =
            !localProxyFormState || VALIDATION_MODE.all;
        }

        localProxyFormState &&
          (localProxyFormState[key as keyof ReadFormState] = true);
        return formState[key as keyof ReadFormState];
      },
    });
  }

  return result;
};
