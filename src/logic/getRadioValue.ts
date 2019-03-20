import { RegisterInput } from '..';

const defaultReturn = {
  isValid: false,
  value: null,
};

export default function getRadioValue(
  options?: Array<RegisterInput>,
): {
  isValid: boolean;
  value: null | number | string;
} {
  return Array.isArray(options)
    ? options.reduce(
        (previous, { ref: { name, checked, value } }: { ref: HTMLInputElement }) =>
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
