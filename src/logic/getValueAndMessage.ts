import * as React from 'react';
import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';
import { ValidationValue, Message } from '../types';

type ValidationValueMessage = {
  value: ValidationValue;
  message: Message;
};

export default (
  validationData?: ValidationValue | ValidationValueMessage,
): {
  value: ValidationValue;
  message: Message;
} => {
  const isPureObject =
    isObject(validationData) &&
    !isRegex(validationData) &&
    !React.isValidElement(validationData);

  return {
    value: isPureObject
      ? (validationData as ValidationValueMessage).value
      : (validationData as ValidationValue),
    message: isPureObject
      ? (validationData as ValidationValueMessage).message
      : '',
  };
};
