import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';
import { ValidationRule } from '../types';

export default (validationData?: ValidationRule) =>
  isObject(validationData) && !isRegex(validationData)
    ? validationData
    : {
        value: validationData,
        message: '',
      };
