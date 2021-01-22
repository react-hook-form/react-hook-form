import { RadioOrCheckboxOption } from '../types';

type RadioFieldResult = {
  isValid: boolean;
  value?: number | string;
};

const defaultReturn: RadioFieldResult = {
  isValid: false,
  value: undefined,
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
