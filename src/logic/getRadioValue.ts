import { RegisterInput } from '../type';

const defaultReturn = {
  isValid: false,
  value: null,
};

export default function getRadioValue(
  options?: RegisterInput[],
): {
  isValid: boolean;
  value: null | number | string;
} {
  return Array.isArray(options)
    ? options.reduce(
        (previous, { ref: { checked, value } }: any) =>
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
