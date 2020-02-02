import isArray from '../utils/isArray';
import isUndefined from '../utils/isUndefined';
import isEmptyString from '../utils/isEmptyString';
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
  if (isArray(options)) {
    if (options.length > 1) {
      const values = options
        .filter(({ ref: { checked } }) => checked)
        .map(({ ref: { value } }) => value);
      return { value: values, isValid: !!values.length };
    }

    const { checked, value, attributes } = options[0].ref;

    return checked
      ? attributes && !isUndefined(attributes.value)
        ? isUndefined(value) || isEmptyString(value)
          ? validResult
          : { value: value, isValid: true }
        : validResult
      : defaultResult;
  }

  return defaultResult;
};
