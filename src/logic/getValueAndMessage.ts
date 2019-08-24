import isNullOrUndefined from '../utils/isNullOrUndefined';
import isObject from '../utils/isObject';
import { ValidationTypes } from '../types';
import isRegex from '../utils/isRegex';

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
      : (validationData as any),
  message:
    isObject(validationData) &&
    !(validationData instanceof RegExp) &&
    validationData.message
      ? validationData.message
      : '',
});
