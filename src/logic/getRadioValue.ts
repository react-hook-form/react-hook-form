import isArray from '../utils/isArray';
import { RadioOrCheckboxOption } from '../types';

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
        (previous, { ref: { checked, value } }): RadioFieldResult =>
          checked
            ? {
                isValid: true,
                value: value || '',
              }
            : previous,
        defaultReturn,
      )
    : defaultReturn;
