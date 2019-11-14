import isArray from '../utils/isArray';
import { Ref, RadioOrCheckboxOption } from '../types';

interface RadioFieldResult {
  isValid: boolean;
  value: number | string;
}

const defaultReturn: RadioFieldResult = {
  isValid: false,
  value: '',
};

export default (options?: RadioOrCheckboxOption[]): RadioFieldResult =>
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
