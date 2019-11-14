import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';
import { ValidationValue } from '../types';

interface ValidationValueMessage {
  value: ValidationValue;
  message: string;
}

export default (
  validationData?: ValidationValue | ValidationValueMessage,
): {
  value: ValidationValue;
  message: string;
} => {
  const isPureObject = isObject(validationData) && !isRegex(validationData);

  return {
    value: isPureObject
      ? (validationData as ValidationValueMessage).value
      : (validationData as ValidationValue),
    message: isPureObject
      ? (validationData as ValidationValueMessage).message
      : '',
  };
};
