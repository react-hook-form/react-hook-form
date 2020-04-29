import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';
import { ValidationOption, ValidationValueMessage } from '../types';

export default (validationData?: ValidationOption) => {
  const isValueMessage = (
    value?: ValidationOption,
  ): value is ValidationValueMessage => isObject(value) && !isRegex(value);

  return isValueMessage(validationData)
    ? validationData
    : {
        value: validationData,
        message: '',
      };
};
