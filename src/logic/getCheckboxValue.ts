import isUndefined from '../utils/isUndefined';
import { RadioOrCheckboxOption } from '../types';

type CheckboxFieldResult = {
  isValid: boolean;
  value: string | string[] | boolean;
};

const defaultResult: CheckboxFieldResult = {
  value: false,
  isValid: false,
};

const validResult = { value: true, isValid: true };

export default (options?: RadioOrCheckboxOption[]): CheckboxFieldResult => {
  if (Array.isArray(options)) {
    if (options.length > 1) {
      const values = options
        .filter((option) => option && option.ref.checked)
        .map(({ ref: { value } }) => value);
      return { value: values, isValid: !!values.length };
    }

    const { checked, value, attributes } = options[0].ref;

    return checked
      ? attributes && !isUndefined((attributes as any).value)
        ? isUndefined(value) || value === ''
          ? validResult
          : { value: value, isValid: true }
        : validResult
      : defaultResult;
  }

  return defaultResult;
};
