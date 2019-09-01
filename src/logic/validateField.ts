import getRadioValue from './getRadioValue';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isRadioInput from '../utils/isRadioInput';
import getValueAndMessage from './getValueAndMessage';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isString from '../utils/isString';
import isEmptyObject from '../utils/isEmptyObject';
import displayNativeError from './displayNativeError';
import isObject from '../utils/isObject';
import { DATE_INPUTS, STRING_INPUTS } from '../constants';
import isFunction from '../utils/isFunction';
import isBoolean from '../utils/isBoolean';
import getFieldsValue from './getFieldValue';
import isRegex from '../utils/isRegex';
import {
  Field,
  ErrorMessages,
  FieldValues,
  ValidatePromiseResult,
} from '../types';

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
  fields: FieldValues,
  nativeValidation?: boolean,
): Promise<ErrorMessages<any>> => {
  const error: FieldValues = {};
  const isRadio = isRadioInput(type);
  const isCheckBox = isCheckBoxInput(type);
  const isSelectOrInput = !isCheckBox && !isRadio;
  const nativeError = displayNativeError.bind(null, nativeValidation, ref);
  const isStringInput = STRING_INPUTS.includes(type) || isString(value);

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
      ref: isRadio ? fields[name].options[0].ref : ref,
    };
    nativeError(required);
    return error;
  }

  if (!isNullOrUndefined(min) || !isNullOrUndefined(max)) {
    let exceedMax;
    let exceedMin;
    const { value: maxValue, message: maxMessage } = getValueAndMessage(max);
    const { value: minValue, message: minMessage } = getValueAndMessage(min);

    if (type === 'number') {
      const valueNumber = parseFloat(value);
      if (!isNullOrUndefined(maxValue)) exceedMax = valueNumber > maxValue;
      if (!isNullOrUndefined(minValue)) exceedMin = valueNumber < minValue;
    } else if (DATE_INPUTS.includes(type)) {
      if (isString(maxValue)) exceedMax = new Date(value) > new Date(maxValue);
      if (isString(minValue)) exceedMin = new Date(value) < new Date(minValue);
    }

    if (exceedMax || exceedMin) {
      if (exceedMax) {
        error[name] = {
          type: 'max',
          message: maxMessage,
          ref,
        };
      }
      if (exceedMin) {
        error[name] = {
          type: 'min',
          message: minMessage,
          ref,
        };
      }
      nativeError(exceedMax ? maxMessage : minMessage);
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

    if (exceedMax || exceedMin) {
      if (exceedMax) {
        error[name] = {
          type: 'maxLength',
          message: maxLengthMessage,
          ref,
        };
      }
      if (exceedMin) {
        error[name] = {
          type: 'minLength',
          message: minLengthMessage,
          ref,
        };
      }
      nativeError(exceedMax ? maxLengthMessage : minLengthMessage);
      return error;
    }
  }

  if (pattern) {
    const { value: patternValue, message: patternMessage } = getValueAndMessage(
      pattern,
    );

    if (isRegex(patternValue) && !patternValue.test(value)) {
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
    const fieldValue = getFieldsValue(fields, ref);
    const validateRef = isRadio && options ? options[0].ref : ref;

    if (isFunction(validate)) {
      const result = await validate(fieldValue);
      const isStringValue = isString(result);
      if (isStringValue || (isBoolean(result) && !result)) {
        const message = isStringValue ? result : '';
        error[name] = {
          type: 'validate',
          message,
          ref: validateRef,
        };
        nativeError(message);
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

            if (isFunction(validate)) {
              const result = await validate(fieldValue);
              const isStringValue = isString(result);

              if (isStringValue || (isBoolean(result) && !result)) {
                const message = isStringValue ? result : '';
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

      if (!isEmptyObject(validationResult)) {
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
