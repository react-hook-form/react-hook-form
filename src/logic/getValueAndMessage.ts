import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';
import { ValidationOption, ValidationValueMessage } from '../types/form';

const isValueMessage = (
  value?: ValidationOption,
): value is ValidationValueMessage => isObject(value) && !isRegex(value);

export default (validationData?: ValidationOption) =>
  isValueMessage(validationData)
    ? validationData
    : {
        value: validationData,
        message: '',
      };
