import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';
import { ValidationRule } from '..';

export default (validationData?: ValidationRule) =>
  isObject(validationData) && !isRegex(validationData)
    ? validationData
    : {
        value: validationData,
        message: '',
      };
