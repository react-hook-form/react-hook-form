import { Ref, ValidationOptions, RadioReturn } from '../types';

const defaultReturn: RadioReturn = {
  isValid: false,
  value: '',
};

export default function getRadioValue(options?: ValidationOptions[]): RadioReturn {
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
