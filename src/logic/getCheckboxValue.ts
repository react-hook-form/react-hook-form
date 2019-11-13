import isArray from '../utils/isArray';
import { RadioOrCheckboxOption, CheckboxFieldResult } from '../types';
import { isUndefined } from 'util';
import isEmptyString from '../utils/isEmptyString';

const defaultResult: CheckboxFieldResult = {
  value: false,
  isValid: false,
};

export default (options?: RadioOrCheckboxOption[]): CheckboxFieldResult => {
  if (isArray(options)) {
    if (options.length > 1) {
      const values = options
        .filter(({ ref: { checked } }) => checked)
        .map(({ ref: { value } }) => value);
      return { value: values, isValid: !!values.length };
    } else {
      if (options[0].ref.checked) {
        return isUndefined(options[0].ref.value) ||
          isEmptyString(options[0].ref.value)
          ? { value: true, isValid: true }
          : { value: options[0].ref.value, isValid: true };
      }
      return { value: false, isValid: false };
    }
  } else {
    return defaultResult;
  }
};
