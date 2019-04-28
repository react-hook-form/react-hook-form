import { IRegisterInput } from '../type';

const defaultReturn = {
  isValid: false,
  value: null,
};

export default function getRadioValue(
  options?: Array<IRegisterInput>,
): {
  isValid: boolean;
  value: null | number | string;
} {
  return Array.isArray(options)
    ? options.reduce(
        (previous, { ref: { checked, value } }: { ref: any }) =>
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
