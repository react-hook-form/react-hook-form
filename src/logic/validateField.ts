import getRadioValue from './getRadioValue';
import isRadioInput from '../utils/isRadioInput';
import { DATE_INPUTS, STRING_INPUTS } from '../constants';
import { Field } from '..';

export default (
  { ref: { type, value, name, checked }, required, maxLength, minLength, min, max, pattern, custom }: Field,
  fields: { [key: string]: Field },
): { [key: string]: any } => {
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

  if (custom && !custom(value)) {
    copy[name] = {
      ...copy[name],
      custom: true,
    };
  }

  return copy;
};
