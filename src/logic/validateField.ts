import getRadioValue from './getRadioValue';
import isRadioInput from '../utils/isRadioInput';
import { DATE_INPUTS, STRING_INPUTS } from '../constants';
import { ErrorMessages, Field } from '..';

export default (
  { ref: { type, value, name, checked }, required, maxLength, minLength, min, max, pattern, validate }: Field,
  fields: { [key: string]: Field },
): ErrorMessages => {
  const copy = {};

  if (
    required &&
    ((type === 'checkbox' && !checked) ||
      (!isRadioInput(type) && type !== 'checkbox' && value === '') ||
      (isRadioInput(type) && !getRadioValue(fields[name].options).isValid))
  ) {
    copy[name] = {
      required: true,
    };
  }

  if (value === '') return copy;

  // min and max section
  if (min || max) {
    let exceedMax;
    let exceedMin;
    const valueNumber = parseFloat(value);

    if (type === 'number') {
      exceedMax = max && valueNumber > max;
      exceedMin = min && valueNumber < min;
    } else if (DATE_INPUTS.includes(type)) {
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

  if ((maxLength || minLength) && STRING_INPUTS.includes(type)) {
    const exceedMax = maxLength && value.toString().length > maxLength;
    const exceedMin = minLength && value.toString().length < minLength;

    if (exceedMax || exceedMin) {
      copy[name] = {
        ...copy[name],
        ...(exceedMax ? { maxLength: true } : null),
        ...(exceedMin ? { minLength: true } : null),
      };
    }
  }

  if (pattern && pattern instanceof RegExp && !pattern.test(value)) {
    copy[name] = {
      ...copy[name],
      pattern: true,
    };
  }

  if (validate) {
    if (typeof validate === 'function') {
      if (!validate(value)) {
        copy[name] = {
          ...copy[name],
          validate: true,
        };
      }
    } else if (typeof validate === 'object') {
      const result = Object.entries(validate).reduce((previous, [key, validate]) => {
        if (typeof validate === 'function' && !validate(value)) {
          previous[key] = true;
        }
        return previous;
      }, {});

      if (Object.keys(result).length) {
        copy[name] = {
          ...copy[name],
          validate: result,
        };
      }
    }
  }

  return copy;
};
