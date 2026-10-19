import type {
  ValidationRule,
  ValidationValue,
  ValidationValueMessage,
} from '../types';
import isObject from '../utils/isObject';
import isRegex from '../utils/isRegex';

export default <T extends ValidationValue>(
  rule?: ValidationRule<T> | ValidationValueMessage<T>,
) => {
  const value = isObject(rule) && !isRegex(rule) ? rule.value : rule;

  if (isRegex(value)) {
    if (value.ignoreCase) {
      return;
    }

    return `.*(?:${value.source}).*`;
  }

  return value;
};
