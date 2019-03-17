import { RegisterInput } from '..';

const defaultReturn = {
  isValid: false,
  value: null,
};

export default function getRadioValue(
  fields?: Array<RegisterInput>,
): {
  isValid: boolean;
  value: null | number | string,
} {
  return Array.isArray(fields)
    ? fields.reduce(
        (previous, { ref: { name, checked, value } }: RegisterInput) =>
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
