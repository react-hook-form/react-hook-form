import { Ref, RegisterInput } from '../types';

interface RadioReturn {
  isValid: boolean;
  value: number | string;
}

const defaultReturn: RadioReturn = {
  isValid: false,
  value: '',
};

export default function getRadioValue(options?: RegisterInput[]): RadioReturn {
  return Array.isArray(options)
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
