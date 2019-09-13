import isArray from '../utils/isArray';
import { Ref, MutationWatcher } from '../types';

interface RadioFieldResult {
  isValid: boolean;
  value: number | string;
}

const defaultReturn: RadioFieldResult = {
  isValid: false,
  value: '',
};

export default (
  options?: {
    ref?: Ref;
    mutationWatcher?: MutationWatcher;
  }[],
): RadioFieldResult =>
  isArray(options)
    ? options.reduce(
        (previous, { ref: { checked, value } }: Ref): RadioFieldResult =>
          checked
            ? {
                isValid: true,
                value,
              }
            : previous,
        defaultReturn,
      )
    : defaultReturn;
