import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';
import { ValidationTypes } from '../types';

type ValidationValueMessage = { value: ValidationTypes; message: string };

export default (
  validationData?: ValidationTypes | ValidationValueMessage,
): {
  value: ValidationTypes;
  message: string;
} => {
  const isPureObject = isObject(validationData) && !isRegex(validationData);

  return {
    value: isPureObject
      ? (validationData as ValidationValueMessage).value
      : (validationData as ValidationTypes),
    message: isPureObject
      ? (validationData as ValidationValueMessage).message
      : '',
  };
};
