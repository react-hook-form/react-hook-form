import getRadioValue from './getRadioValue';
import isRadioInput from '../utils/isRadioInput';
import { DATE_INPUTS, STRING_INPUTS } from '../constants';
import { Field, Ref } from '../types';
import getValueAndMessage from './getValueAndMessage';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isString from '../utils/isString';

type ValidatePromiseResult =
  | {}
  | void
  | {
      type: string;
      message: string | number | boolean | Date;
    };

export default async (
  {
    ref,
    ref: { type, value, name, checked },
    options,
    required,
    maxLength,
    minLength,
    min,
    max,
    pattern,
    validate,
  }: Field,
  fields: { [key: string]: Field },
): Promise<{
  [key: string]: {
    type: string;
    message: string;
    ref: Ref;
  };
}> => {
  const error = {};
  const isRadio = isRadioInput(type);
  const isCheckBox = isCheckBoxInput(type);

  if (
    required &&
    ((isCheckBox && !checked) ||
      (!isCheckBox && !isRadio && value === '') ||
      (isRadio && !getRadioValue(fields[name].options).isValid))
  ) {
    error[name] = {
      type: 'required',
      message: isString(required) ? required : '',
      ref: isRadio && fields[name] ? (fields[name].options || [{ ref: '' }])[0].ref : ref,
    };
    return error;
  }

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
      error[name] = {
        ...error[name],
        type: exceedMax ? 'max' : 'min',
        message: exceedMax ? maxMessage : minMessage,
        ref,
      };
      return error;
    }
  }

  if ((maxLength || minLength) && STRING_INPUTS.includes(type)) {
    const { value: maxLengthValue, message: maxLengthMessage } = getValueAndMessage(maxLength);
    const { value: minLengthValue, message: minLengthMessage } = getValueAndMessage(minLength);
    const exceedMax = maxLength && value.toString().length > maxLengthValue;
    const exceedMin = minLength && value.toString().length < minLengthValue;

    if (exceedMax || exceedMin) {
      error[name] = {
        ...error[name],
        type: exceedMax ? 'maxLength' : 'minLength',
        message: exceedMax ? maxLengthMessage : minLengthMessage,
        ref,
      };
      return error;
    }
  }

  if (pattern) {
    const { value: patternValue, message: patternMessage } = getValueAndMessage(pattern);
    if (patternValue instanceof RegExp && !patternValue.test(value)) {
      error[name] = {
        ...error[name],
        type: 'pattern',
        message: patternMessage,
        ref,
      };
      return error;
    }
  }

  if (validate) {
    const fieldValue = isRadio ? getRadioValue(options).value : value;
    const validateRef = isRadio && options ? options[0].ref : ref;

    if (typeof validate === 'function') {
      const result = await validate(fieldValue);
      if (typeof result !== 'boolean' || !result) {
        error[name] = {
          ...error[name],
          type: 'validate',
          message: isString(result) ? result : '',
          ref: validateRef,
        };
        return error;
      }
    } else if (typeof validate === 'object') {
      const validationResult = await new Promise(
        (resolve): ValidatePromiseResult => {
          const values = Object.entries(validate);
          values.reduce(async (previous, [key, validate], index): Promise<ValidatePromiseResult> => {
            const lastChild = values.length - 1 === index;

            if (typeof validate === 'function') {
              const result = await validate(fieldValue);

              if (result !== undefined) {
                const data = {
                  type: key,
                  message: isString(result) ? result : '',
                  ref: validateRef,
                };
                return lastChild ? resolve(data) : data;
              }
            }

            return lastChild ? resolve(previous) : previous;
          }, {});
        },
      );

      if (validationResult && Object.keys(validationResult).length) {
        error[name] = {
          ...error[name],
          ref: validateRef,
          ...validationResult,
        };
        return error;
      }
    }
  }

  return error;
};
