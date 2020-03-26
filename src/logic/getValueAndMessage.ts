import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';
import { ValidationOption, ValidationValueMessage } from '../types';

export default <T extends ValidationOption>(validationData?: T) => {
  const isValueMessage = (value: any): value is ValidationValueMessage =>
    isObject(value) && !isRegex(value);

  return {
    value: isValueMessage(validationData)
      ? validationData.value
      : validationData,
    message: isValueMessage(validationData) ? validationData.message : '',
  };
};
