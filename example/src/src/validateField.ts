import getValidRadioValue from './getValidRadioValue';
import { RegisterInput } from '.';

export default ({ ref, required, maxLength, minLength, min, max, pattern }: RegisterInput, fields) => {
  const copy = { };

  if (
    (ref.type !== 'radio' && required && ref.value === '') ||
    (ref.type === 'radio' && required && !getValidRadioValue(fields[ref.name].options).isValid)
  ) {
    copy[ref.name] = {
      required: true,
    };
  }

  // min and max section
  if (min || max) {
    let exceedMax;
    let exceedMin;

    if (ref.type === 'number') {
      exceedMax = max && ref.value > max;
      exceedMin = min && ref.value < min;
    } else if (['date', 'time', 'month', 'datetime', 'datetime-local', 'week'].includes(ref.type)) {
      exceedMax = max && new Date(ref.value) > new Date(max);
      exceedMin = min && new Date(ref.value) < new Date(min);
    }

    if (exceedMax || exceedMin) {
      copy[ref.name] = {
        ...copy[ref.name],
        ...(exceedMax ? { max: true } : null),
        ...(exceedMin ? { min: true } : null),
      };
    }
  }

  if (maxLength || minLength) {
    if (['text', 'email', 'password', 'search', 'tel', 'url'].includes(ref.type) && typeof ref.value === 'string') {
      const exceedMax = maxLength && ref.value > maxLength;
      const exceedMin = minLength && ref.value < minLength;

      if (exceedMax || exceedMin) {
        copy[ref.name] = {
          ...copy[ref.name],
          ...(exceedMax ? { maxLength: true } : null),
          ...(exceedMin ? { minLength: true } : null),
        };
      }
    }
  }

  if (
    pattern &&
    ref.type === 'text' &&
    typeof ref.value === 'string' &&
    pattern instanceof RegExp &&
    !pattern.test(ref.value)
  ) {
    copy[ref.name] = {
      ...copy[ref.name],
      pattern: true,
    };
  }

  return copy;
};
