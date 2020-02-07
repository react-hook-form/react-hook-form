import * as React from 'react';
import getRadioValue from './getRadioValue';
import getCheckboxValue from './getCheckboxValue';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isRadioInput from '../utils/isRadioInput';
import getValueAndMessage from './getValueAndMessage';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isString from '../utils/isString';
import isEmptyObject from '../utils/isEmptyObject';
import isObject from '../utils/isObject';
import isFunction from '../utils/isFunction';
import getFieldsValue from './getFieldValue';
import isRegex from '../utils/isRegex';
import isEmptyString from '../utils/isEmptyString';
import isBoolean from '../utils/isBoolean';
import getValidateError from './getValidateError';
import appendErrors from './appendErrors';
import { INPUT_VALIDATION_RULES } from '../constants';
import {
  Field,
  FieldErrors,
  FieldValues,
  FieldError,
  FieldRefs,
} from '../types';

type ValidatePromiseResult = {} | void | FieldError;

export default async <FormValues extends FieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<FormValues>>,
  validateAllFieldCriteria: boolean,
  {
    ref,
    ref: { type, value, name },
    options,
    required,
    maxLength,
    minLength,
    min,
    max,
    pattern,
    validate,
  }: Field,
): Promise<FieldErrors<FormValues>> => {
  const fields = fieldsRef.current;
  const error: any = {};
  const isRadio = isRadioInput(ref);
  const isCheckBox = isCheckBoxInput(ref);
  const isRadioOrCheckbox = isRadio || isCheckBox;
  const isEmpty = isEmptyString(value);
  const appendErrorsCurry = appendErrors.bind(
    null,
    name,
    validateAllFieldCriteria,
    error,
  );
  const getMinMaxMessage = (
    exceedMax: boolean,
    maxLengthMessage: string,
    minLengthMessage: string,
    maxType = INPUT_VALIDATION_RULES.maxLength,
    minType = INPUT_VALIDATION_RULES.minLength,
  ) => {
    const message = exceedMax ? maxLengthMessage : minLengthMessage;
    error[name] = {
      type: exceedMax ? maxType : minType,
      message,
      ref,
      ...(exceedMax
        ? appendErrorsCurry(maxType, message)
        : appendErrorsCurry(minType, message)),
    };
    if (!validateAllFieldCriteria) {
      return error;
    }
  };

  if (
    required &&
    ((!isRadio && !isCheckBox && (isEmpty || isNullOrUndefined(value))) ||
      (isBoolean(value) && !value) ||
      (isCheckBox && !getCheckboxValue(options).isValid) ||
      (isRadio && !getRadioValue(options).isValid))
  ) {
    const message = isString(required)
      ? required
      : getValueAndMessage(required).message;

    error[name] = {
      type: INPUT_VALIDATION_RULES.required,
      message,
      ref: isRadioOrCheckbox ? (fields[name] as any).options[0].ref : ref,
      ...appendErrorsCurry(INPUT_VALIDATION_RULES.required, message),
    };
    if (!validateAllFieldCriteria) {
      return error;
    }
  }

  if (!isNullOrUndefined(min) || !isNullOrUndefined(max)) {
    let exceedMax;
    let exceedMin;
    const { value: maxValue, message: maxMessage } = getValueAndMessage(max);
    const { value: minValue, message: minMessage } = getValueAndMessage(min);

    if (type === 'number' || (!type && !isNaN(value))) {
      const valueNumber =
        (ref as HTMLInputElement).valueAsNumber || parseFloat(value);
      if (!isNullOrUndefined(maxValue)) {
        exceedMax = valueNumber > maxValue;
      }
      if (!isNullOrUndefined(minValue)) {
        exceedMin = valueNumber < minValue;
      }
    } else {
      const valueDate =
        (ref as HTMLInputElement).valueAsDate || new Date(value);
      if (isString(maxValue)) {
        exceedMax = valueDate > new Date(maxValue);
      }
      if (isString(minValue)) {
        exceedMin = valueDate < new Date(minValue);
      }
    }

    if (exceedMax || exceedMin) {
      getMinMaxMessage(
        !!exceedMax,
        maxMessage,
        minMessage,
        INPUT_VALIDATION_RULES.max,
        INPUT_VALIDATION_RULES.min,
      );
      if (!validateAllFieldCriteria) {
        return error;
      }
    }
  }

  if (isString(value) && !isEmpty && (maxLength || minLength)) {
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
      getMinMaxMessage(!!exceedMax, maxLengthMessage, minLengthMessage);
      if (!validateAllFieldCriteria) {
        return error;
      }
    }
  }

  if (pattern && !isEmpty) {
    const { value: patternValue, message: patternMessage } = getValueAndMessage(
      pattern,
    );

    if (isRegex(patternValue) && !patternValue.test(value)) {
      error[name] = {
        type: INPUT_VALIDATION_RULES.pattern,
        message: patternMessage,
        ref,
        ...appendErrorsCurry(INPUT_VALIDATION_RULES.pattern, patternMessage),
      };
      if (!validateAllFieldCriteria) {
        return error;
      }
    }
  }

  if (validate) {
    const fieldValue = getFieldsValue(fields, ref);
    const validateRef = isRadioOrCheckbox && options ? options[0].ref : ref;

    if (isFunction(validate)) {
      const result = await validate(fieldValue);
      const validateError = getValidateError(result, validateRef);

      if (validateError) {
        error[name] = {
          ...validateError,
          ...appendErrorsCurry(
            INPUT_VALIDATION_RULES.validate,
            validateError.message,
          ),
        };
        if (!validateAllFieldCriteria) {
          return error;
        }
      }
    } else if (isObject(validate)) {
      const validateFunctions = Object.entries(validate);
      const validationResult = await new Promise(
        (resolve): ValidatePromiseResult => {
          validateFunctions.reduce(
            async (
              previous,
              [key, validate],
              index,
            ): Promise<ValidatePromiseResult> => {
              if (
                (!isEmptyObject(await previous) && !validateAllFieldCriteria) ||
                !isFunction(validate)
              ) {
                return resolve(previous);
              }

              let result;
              const validateResult = await validate(fieldValue);
              const validateError = getValidateError(
                validateResult,
                validateRef,
                key,
              );

              if (validateError) {
                result = {
                  ...validateError,
                  ...appendErrorsCurry(key, validateError.message),
                };

                if (validateAllFieldCriteria) {
                  error[name] = result;
                }
              } else {
                result = previous;
              }

              return validateFunctions.length - 1 === index
                ? resolve(result)
                : result;
            },
            {},
          );
        },
      );

      if (!isEmptyObject(validationResult)) {
        error[name] = {
          ref: validateRef,
          ...(validationResult as { type: string; message?: string }),
        };
        if (!validateAllFieldCriteria) {
          return error;
        }
      }
    }
  }

  return error;
};
