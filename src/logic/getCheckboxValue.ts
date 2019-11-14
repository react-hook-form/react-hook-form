import isArray from '../utils/isArray';
import isUndefined from '../utils/isUndefined';
import isEmptyString from '../utils/isEmptyString';
import { RadioOrCheckboxOption } from '../types';

interface CheckboxFieldResult {
  isValid: boolean;
  value: string | string[] | boolean;
}

const defaultResult: CheckboxFieldResult = {
  value: false,
  isValid: false,
};

export default (options?: RadioOrCheckboxOption[]): CheckboxFieldResult => {
  if (isArray(options)) {
    if (options.length) {
      const values = options
        .filter(({ ref: { checked } }) => checked)
        .map(({ ref: { value } }) => value);
      return { value: values, isValid: !!values.length };
    } else {
      if (options[0].ref.checked) {
        return options[0].ref.attributes.value
          ? isUndefined(options[0].ref.value) ||
            isEmptyString(options[0].ref.value)
            ? { value: true, isValid: true }
            : { value: options[0].ref.value, isValid: true }
          : { value: true, isValid: true };
      }
      return { value: false, isValid: false };
    }
  } else {
    return defaultResult;
  }
};
