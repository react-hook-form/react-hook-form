import isArray from '../utils/isArray';
import { Ref, RadioReturn, MutationWatcher } from '../types';

const defaultReturn: RadioReturn = {
  isValid: false,
  value: '',
};

export default (
  options?: {
    ref?: Ref;
    mutationWatcher?: MutationWatcher;
  }[],
): RadioReturn =>
  options && isArray(options)
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
