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
    if (options.length > 1) {
      const values = options
        .filter(({ ref: { checked } }) => checked)
        .map(({ ref: { value } }) => value);
      return { value: values, isValid: !!values.length };
    } else {
      const {
        checked,
        value,
        attributes: { value: valueAttribute },
      } = options[0].ref;
      if (checked) {
        return valueAttribute
          ? isUndefined(value) || isEmptyString(value)
            ? { value: true, isValid: true }
            : { value: value, isValid: true }
          : { value: true, isValid: true };
      }
      return defaultResult;
    }
  } else {
    return defaultResult;
  }
};
