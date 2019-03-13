import getRadioValue from './getRadioValue';
import isRadioInput from '../utils/isRadioInput';
import { RegisterInput } from '..';

export default (
  { ref: { type, value, name }, required, maxLength, minLength, min, max, pattern, custom }: RegisterInput,
  fields: { [key: string]: RegisterInput },
) => {
  const copy = {};

  if (
    (!isRadioInput(type) && required && value === '') ||
    (isRadioInput(type) && required && !getRadioValue(fields[name].options).isValid)
  ) {
    copy[name] = {
      required: true,
    };
  }

  // min and max section
  if (min || max) {
    let exceedMax;
    let exceedMin;
    const valueNumber = parseFloat(value);

    if (type === 'number') {
      exceedMax = max && valueNumber > max;
      exceedMin = min && valueNumber < min;
    } else if (['date', 'time', 'month', 'datetime', 'datetime-local', 'week'].includes(type)) {
      exceedMax = max && new Date(value) > new Date(max);
      exceedMin = min && new Date(value) < new Date(min);
    }

    if (exceedMax || exceedMin) {
      copy[name] = {
        ...copy[name],
        ...(exceedMax ? { max: true } : null),
        ...(exceedMin ? { min: true } : null),
      };
    }
  }

  if (maxLength || minLength) {
    if (['text', 'email', 'password', 'search', 'tel', 'url'].includes(type) && typeof value === 'string') {
      const exceedMax = maxLength && value.length > maxLength;
      const exceedMin = minLength && value.length < minLength;

      if (exceedMax || exceedMin) {
        copy[name] = {
          ...copy[name],
          ...(exceedMax ? { maxLength: true } : null),
          ...(exceedMin ? { minLength: true } : null),
        };
      }
    }
  }

  if (pattern && type === 'text' && typeof value === 'string' && pattern instanceof RegExp && !pattern.test(value)) {
    copy[name] = {
      ...copy[name],
      pattern: true,
    };
  }

  if (custom && !custom(value)) {
    copy[name] = {
      ...copy[name],
      custom: true,
    };
  }

  return copy;
};
