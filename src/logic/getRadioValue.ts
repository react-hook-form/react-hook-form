import { RadioOrCheckboxOption } from '../types';

type RadioFieldResult = {
  isValid: boolean;
  value: number | string | null;
};

const defaultReturn: RadioFieldResult = {
  isValid: false,
  value: null,
};

export default (options?: RadioOrCheckboxOption[]): RadioFieldResult =>
  Array.isArray(options)
    ? options.reduce(
        (previous, option): RadioFieldResult =>
          option && option.ref.checked
            ? {
                isValid: true,
                value: option.ref.value,
              }
            : previous,
        defaultReturn,
      )
    : defaultReturn;
