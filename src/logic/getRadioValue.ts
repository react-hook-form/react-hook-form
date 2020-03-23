import isArray from '../utils/isArray';
import { RadioOrCheckboxOption } from '../types';

type RadioFieldResult = {
  isValid: boolean;
  value: number | string;
};

const defaultReturn: RadioFieldResult = {
  isValid: false,
  value: '',
};

export default (options?: RadioOrCheckboxOption[]): RadioFieldResult =>
  isArray(options)
    ? options.filter(Boolean).reduce(
        (previous, { ref: { checked, value } }): RadioFieldResult =>
          checked
            ? {
                isValid: true,
                value,
              }
            : previous,
        defaultReturn,
      )
    : defaultReturn;
