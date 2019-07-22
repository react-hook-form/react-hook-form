import getRadioValue from './getRadioValue';
import isRadioInput from '../utils/isRadioInput';
import getValueAndMessage from './getValueAndMessage';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isString from '../utils/isString';
import isEmptyObject from '../utils/isEmptyObject';
import displayNativeError from './displayNativeError';
import isObject from '../utils/isObject';
import { DATE_INPUTS, STRING_INPUTS } from '../constants';
import { Field, ErrorMessages, DataType } from '../types';

type ValidatePromiseResult =
  | {}
  | void
  | {
      type: string;
      message: string | number | boolean | Date;
    };

export default async <Data>(
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
  fields: DataType,
  nativeValidation?: boolean,
): Promise<ErrorMessages<any>> => {
  const error: DataType = {};
  const isRadio = isRadioInput(type);
  const isCheckBox = isCheckBoxInput(type);
  const isSelectOrInput = !isCheckBox && !isRadio;
  const nativeError = displayNativeError.bind(null, nativeValidation, ref);
  const isStringInput = STRING_INPUTS.includes(type);

  if (
    required &&
    ((isCheckBox && !checked) ||
      (isSelectOrInput && value === '') ||
      (isRadio && !getRadioValue(fields[name].options).isValid) ||
      (!type && !value))
  ) {
    error[name] = {
      type: 'required',
      message: isString(required) ? required : '',
      ref: isRadio ? (fields[name].options || [{ ref: '' }])[0].ref : ref,
    };
    nativeError(required);
    return error;
  }

  if ((min || max) && !isStringInput) {
    let exceedMax;
    let exceedMin;
    const valueNumber = parseFloat(value);
    const { value: maxValue, message: maxMessage } = getValueAndMessage(max);
    const { value: minValue, message: minMessage } = getValueAndMessage(min);
    const message = exceedMax ? maxMessage : minMessage;

    if (type === 'number') {
      exceedMax = maxValue && valueNumber > maxValue;
      exceedMin = minValue && valueNumber < minValue;
    } else if (DATE_INPUTS.includes(type)) {
      if (typeof maxValue === 'string')
        exceedMax = maxValue && new Date(value) > new Date(maxValue);
      if (typeof minValue === 'string')
        exceedMin = minValue && new Date(value) < new Date(minValue);
    }

    if (exceedMax || exceedMin) {
      error[name] = {
        type: exceedMax ? 'max' : 'min',
        message,
        ref,
      };
      nativeError(message);
      return error;
    }
  }

  if ((maxLength || minLength) && isStringInput) {
    const {
      value: maxLengthValue,
      message: maxLengthMessage,
    } = getValueAndMessage(maxLength);
    const {
      value: minLengthValue,
      message: minLengthMessage,
    } = getValueAndMessage(minLength);
    const inputLength = value.toString().length;
    const exceedMax = maxLength && inputLength > maxLengthValue;
    const exceedMin = minLength && inputLength < minLengthValue;
    const message = exceedMax ? maxLengthMessage : minLengthMessage;

    if (exceedMax || exceedMin) {
      error[name] = {
        type: exceedMax ? 'maxLength' : 'minLength',
        message,
        ref,
      };
      nativeError(message);
      return error;
    }
  }

  if (pattern) {
    const { value: patternValue, message: patternMessage } = getValueAndMessage(
      pattern,
    );

    if (patternValue instanceof RegExp && !patternValue.test(value)) {
      error[name] = {
        type: 'pattern',
        message: patternMessage,
        ref,
      };
      nativeError(patternMessage);
      return error;
    }
  }

  if (validate) {
    const fieldValue = isRadio ? getRadioValue(options).value : value;
    const validateRef = isRadio && options ? options[0].ref : ref;

    if (typeof validate === 'function') {
      const result = await validate(fieldValue);
      if (
        (isString(result) && result) ||
        (typeof result === 'boolean' && !result)
      ) {
        error[name] = {
          type: 'validate',
          message: isString(result) ? result : '',
          ref: validateRef,
        };
        nativeError(result);
        return error;
      }
    } else if (isObject(validate)) {
      const validationResult = await new Promise(
        (resolve): ValidatePromiseResult => {
          const values = Object.entries(validate);
          values.reduce(async (previous, [key, validate], index): Promise<
            ValidatePromiseResult
          > => {
            const lastChild = values.length - 1 === index;

            if (typeof validate === 'function') {
              const result = await validate(fieldValue);

              if (typeof result !== 'boolean' || !result) {
                const message = isString(result) ? result : '';
                const data = {
                  type: key,
                  message,
                  ref: validateRef,
                };
                nativeError(message);
                return lastChild ? resolve(data) : data;
              }
            }

            return lastChild ? resolve(previous) : previous;
          }, {});
        },
      );

      if (validationResult && !isEmptyObject(validationResult)) {
        error[name] = {
          ref: validateRef,
          ...validationResult,
        };
        return error;
      }
    }
  }

  if (nativeValidation) ref.setCustomValidity('');
  return error;
};
