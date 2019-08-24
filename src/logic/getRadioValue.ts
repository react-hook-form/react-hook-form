import { Ref, RadioReturn, MutationWatcher } from '../types';

const defaultReturn: RadioReturn = {
  isValid: false,
  value: '',
};

export default function getRadioValue(
  options?: {
    ref?: Ref;
    mutationWatcher?: MutationWatcher;
  }[],
): RadioReturn {
  return options && Array.isArray(options)
    ? options.reduce(
        (previous, { ref: { checked, value } }: Ref): RadioReturn =>
          checked
            ? {
                isValid: true,
                value,
              }
            : previous,
        defaultReturn,
      )
    : defaultReturn;
}
