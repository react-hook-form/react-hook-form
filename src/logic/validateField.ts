import getRadioValue from './getRadioValue';
import isRadioInput from '../utils/isRadioInput';
import { DATE_INPUTS, STRING_INPUTS } from '../constants';
import { ErrorMessages, Field } from '..';

function getValueAndMessage(
  item,
): {
  value: any;
  message: string;
} {
  return {
    value: typeof item === 'object' ? item.value : item,
    message: typeof item === 'object' ? item.message : true,
  };
}

export default (
  { ref: { type, value, name, checked }, options, required, maxLength, minLength, min, max, pattern, validate }: Field,
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
      required: required || true,
    };
  }

  if (value === '') return copy;

  // min and max section
  if (min || max) {
    let exceedMax;
    let exceedMin;
    const valueNumber = parseFloat(value);

    const { value: maxValue, message: maxMessage } = getValueAndMessage(max);
    const { value: minValue, message: minMessage } = getValueAndMessage(min);

    if (type === 'number') {
      exceedMax = maxValue && valueNumber > maxValue;
      exceedMin = minValue && valueNumber < minValue;
    } else if (DATE_INPUTS.includes(type)) {
      if (typeof maxValue === 'string') exceedMax = maxValue && new Date(value) > new Date(maxValue);
      if (typeof minValue === 'string') exceedMin = minValue && new Date(value) < new Date(minValue);
    }

    if (exceedMax || exceedMin) {
      copy[name] = {
        ...copy[name],
        ...(exceedMax ? { max: maxMessage } : null),
        ...(exceedMin ? { min: minMessage } : null),
      };
    }
  }

  if ((maxLength || minLength) && STRING_INPUTS.includes(type)) {
    const { value: maxLengthValue, message: maxLengthMessage } = getValueAndMessage(maxLength);
    const { value: minLengthValue, message: minLengthMessage } = getValueAndMessage(minLength);

    const exceedMax = maxLength && value.toString().length > maxLengthValue;
    const exceedMin = minLength && value.toString().length < minLengthValue;

    if (exceedMax || exceedMin) {
      copy[name] = {
        ...copy[name],
        ...(exceedMax ? { maxLength: maxLengthMessage } : null),
        ...(exceedMin ? { minLength: minLengthMessage } : null),
      };
    }
  }

  if (pattern) {
    const { value: patternValue, message: patternMessage } = getValueAndMessage(max);
    if (patternValue instanceof RegExp && !patternValue.test(value)) {
      copy[name] = {
        ...copy[name],
        pattern: patternMessage,
      };
    }
  }

  if (validate) {
    const fieldValue = isRadioInput(type) ? getRadioValue(options).value : value;
    if (typeof validate === 'function') {
      if (!validate(fieldValue)) {
        copy[name] = {
          ...copy[name],
          validate: true,
        };
      }
    } else if (typeof validate === 'object') {
      const result = Object.entries(validate).reduce((previous, [key, validate]) => {
        if (typeof validate === 'function' && !validate(fieldValue)) {
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
