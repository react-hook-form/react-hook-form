import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';
import { ValidationRule, ValidationValueMessage } from '../types';

const isValueMessage = (
  value?: ValidationRule,
): value is ValidationValueMessage => isObject(value) && !isRegex(value);

export default (validationData?: ValidationRule) =>
  isValueMessage(validationData)
    ? validationData
    : {
        value: validationData,
        message: '',
      };
