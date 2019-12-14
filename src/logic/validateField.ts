import * as React from 'react';
import getRadioValue from './getRadioValue';
import getCheckboxValue from './getCheckboxValue';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isRadioInput from '../utils/isRadioInput';
import getValueAndMessage from './getValueAndMessage';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isString from '../utils/isString';
import isEmptyObject from '../utils/isEmptyObject';
import displayNativeError from './displayNativeError';
import isObject from '../utils/isObject';
import isFunction from '../utils/isFunction';
import getFieldsValue from './getFieldValue';
import isRegex from '../utils/isRegex';
import isEmptyString from '../utils/isEmptyString';
import getValidateError from './getValidateError';
import transformToNestObject from './transformToNestObject';
import appendErrors from './appendErrors';
import { INPUT_VALIDATION_RULES } from '../constants';
import {
  Field,
  FieldErrors,
  FieldValues,
  FieldName,
  FieldError,
  FieldRefs,
} from '../types';

type ValidatePromiseResult = {} | void | FieldError;

export default async <FormValues extends FieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<FormValues>>,
  nativeValidation: boolean,
  validateAllFieldCriteria: boolean,
  {
    ref,
    ref: { type, value, name, valueAsNumber, valueAsDate },
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
  const error: FieldErrors<FormValues> = {};
  const isRadio = isRadioInput(type);
  const isCheckBox = isCheckBoxInput(type);
  const isRadioOrCheckbox = isRadio || isCheckBox;
  const isEmpty = isEmptyString(value);
  const nativeError = displayNativeError.bind(null, nativeValidation, ref);
  const appendErrorsCurry = appendErrors.bind(
    null,
    name,
    validateAllFieldCriteria,
    error,
  );

  if (
    required &&
    ((!isRadio && !isCheckBox && (isEmpty || isNullOrUndefined(value))) ||
      (isCheckBox && !getCheckboxValue(options).isValid) ||
      (isRadio && !getRadioValue(options).isValid))
  ) {
    const message = isString(required)
      ? required
      : getValueAndMessage(required).message;

    error[name as FieldName<FormValues>] = {
      type: INPUT_VALIDATION_RULES.required,
      message,
      ref: isRadioOrCheckbox ? (fields[name] as any).options[0].ref : ref,
      ...appendErrorsCurry(INPUT_VALIDATION_RULES.required, message),
    };
    nativeError(message);
    if (!validateAllFieldCriteria) {
      return transformToNestObject(error);
    }
  }

  if (!isNullOrUndefined(min) || !isNullOrUndefined(max)) {
    let exceedMax;
    let exceedMin;
    const { value: maxValue, message: maxMessage } = getValueAndMessage(max);
    const { value: minValue, message: minMessage } = getValueAndMessage(min);

    if (type === 'number') {
      const valueNumber = valueAsNumber || parseFloat(value);
      if (!isNullOrUndefined(maxValue)) {
        exceedMax = valueNumber > maxValue;
      }
      if (!isNullOrUndefined(minValue)) {
        exceedMin = valueNumber < minValue;
      }
    } else {
      const valueDate = valueAsDate || new Date(value);
      if (isString(maxValue)) {
        exceedMax = valueDate > new Date(maxValue);
      }
      if (isString(minValue)) {
        exceedMin = valueDate < new Date(minValue);
      }
    }

    if (exceedMax || exceedMin) {
      const message = exceedMax ? maxMessage : minMessage;
      error[name as FieldName<FormValues>] = {
        type: exceedMax
          ? INPUT_VALIDATION_RULES.max
          : INPUT_VALIDATION_RULES.min,
        message,
        ref,
        ...(exceedMax
          ? appendErrorsCurry(INPUT_VALIDATION_RULES.max, message)
          : appendErrorsCurry(INPUT_VALIDATION_RULES.min, message)),
      };
      nativeError(message);
      if (!validateAllFieldCriteria) {
        return transformToNestObject(error);
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
      const message = exceedMax ? maxLengthMessage : minLengthMessage;
      error[name as FieldName<FormValues>] = {
        type: exceedMax
          ? INPUT_VALIDATION_RULES.maxLength
          : INPUT_VALIDATION_RULES.minLength,
        message,
        ref,
        ...(exceedMax
          ? appendErrorsCurry(INPUT_VALIDATION_RULES.maxLength, message)
          : appendErrorsCurry(INPUT_VALIDATION_RULES.minLength, message)),
      };
      nativeError(message);
      if (!validateAllFieldCriteria) {
        return transformToNestObject(error);
      }
    }
  }

  if (pattern && !isEmpty) {
    const { value: patternValue, message: patternMessage } = getValueAndMessage(
      pattern,
    );

    if (isRegex(patternValue) && !patternValue.test(value)) {
      error[name as FieldName<FormValues>] = {
        type: INPUT_VALIDATION_RULES.pattern,
        message: patternMessage,
        ref,
        ...appendErrorsCurry(INPUT_VALIDATION_RULES.pattern, patternMessage),
      };
      nativeError(patternMessage);
      if (!validateAllFieldCriteria) {
        return transformToNestObject(error);
      }
    }
  }

  if (validate) {
    const fieldValue = getFieldsValue(fields, ref);
    const validateRef = isRadioOrCheckbox && options ? options[0].ref : ref;

    if (isFunction(validate)) {
      const result = await validate(fieldValue);
      const validateError = getValidateError(result, validateRef, nativeError);

      if (validateError) {
        error[name as FieldName<FormValues>] = {
          ...validateError,
          ...appendErrorsCurry(
            INPUT_VALIDATION_RULES.validate,
            validateError.message,
          ),
        };
        if (!validateAllFieldCriteria) {
          return transformToNestObject(error);
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
                nativeError,
                key,
              );

              if (validateError) {
                result = {
                  ...validateError,
                  ...appendErrorsCurry(key, validateError.message),
                };

                if (validateAllFieldCriteria) {
                  error[name as FieldName<FormValues>] = result;
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
        error[name as FieldName<FormValues>] = {
          ref: validateRef,
          ...(validationResult as { type: string; message?: string }),
        };
        if (!validateAllFieldCriteria) {
          return transformToNestObject(error);
        }
      }
    }
  }

  if (nativeValidation) {
    ref.setCustomValidity('');
  }

  return transformToNestObject(error);
};
