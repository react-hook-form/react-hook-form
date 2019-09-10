import isNullOrUndefined from '../utils/isNullOrUndefined';
import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';
import { ValidationTypes } from '../types';

export default (
  validationData?:
    | ValidationTypes
    | { value: ValidationTypes; message: string },
): {
  value: ValidationTypes;
  message: string;
} => ({
  value:
    isObject(validationData) &&
    !isRegex(validationData) &&
    !isNullOrUndefined(validationData.value)
      ? validationData.value
      : (validationData as ValidationTypes),
  message:
    isObject(validationData) &&
    !(validationData instanceof RegExp) &&
    validationData.message
      ? validationData.message
      : '',
});
