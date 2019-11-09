import isArray from '../utils/isArray';
import { Ref, RadioOption, RadioFieldResult } from '../types';

const defaultReturn: RadioFieldResult = {
  isValid: false,
  value: '',
};

export default (options?: RadioOption[]): RadioFieldResult =>
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
