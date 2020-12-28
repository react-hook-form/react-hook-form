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
import isRegex from '../utils/isRegex';
import isBoolean from '../utils/isBoolean';
import isMessage from '../utils/isMessage';
import getValidateError from './getValidateError';
import appendErrors from './appendErrors';
import { INPUT_VALIDATION_RULES } from '../constants';
import {
  Field,
  FieldRefs,
  Message,
  FieldError,
  InternalFieldErrors,
} from '../types';

export default async (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  validateAllFieldCriteria: boolean,
  field: Field,
): Promise<InternalFieldErrors> => {
  const {
    ref,
    refs,
    required,
    maxLength,
    minLength,
    min,
    max,
    pattern,
    validate,
    name,
  } = field;
  const error: InternalFieldErrors = {};
  const isRadio = isRadioInput(ref);
  const inputValue: any = field.value;
  const isCheckBox = isCheckBoxInput(ref);
  const isRadioOrCheckbox = isRadio || isCheckBox;
  const isEmpty =
    !inputValue || (Array.isArray(inputValue) && !inputValue.length);
  const appendErrorsCurry = appendErrors.bind(
    null,
    name,
    validateAllFieldCriteria,
    error,
  );
  const getMinMaxMessage = (
    exceedMax: boolean,
    maxLengthMessage: Message,
    minLengthMessage: Message,
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
  };

  if (
    required &&
    ((!isRadio && !isCheckBox && (isEmpty || isNullOrUndefined(inputValue))) ||
      (isBoolean(inputValue) && !inputValue) ||
      (isCheckBox && !getCheckboxValue(refs).isValid) ||
      (isRadio && !getRadioValue(refs).isValid))
  ) {
    const { value, message } = isMessage(required)
      ? { value: !!required, message: required }
      : getValueAndMessage(required);

    if (value) {
      error[name] = {
        type: INPUT_VALIDATION_RULES.required,
        message,
        ref: isRadioOrCheckbox
          ? ((fieldsRef.current[name] as Field).refs || [])[0] || {}
          : ref,
        ...appendErrorsCurry(INPUT_VALIDATION_RULES.required, message),
      };
      if (!validateAllFieldCriteria) {
        return error;
      }
    }
  }

  if (
    (!isNullOrUndefined(min) || !isNullOrUndefined(max)) &&
    inputValue !== ''
  ) {
    let exceedMax;
    let exceedMin;
    const maxOutput = getValueAndMessage(max);
    const minOutput = getValueAndMessage(min);

    if (!isNaN(inputValue)) {
      const valueNumber =
        (ref as HTMLInputElement).valueAsNumber || parseFloat(inputValue);
      if (!isNullOrUndefined(maxOutput.value)) {
        exceedMax = valueNumber > maxOutput.value;
      }
      if (!isNullOrUndefined(minOutput.value)) {
        exceedMin = valueNumber < minOutput.value;
      }
    } else {
      const valueDate =
        (ref as HTMLInputElement).valueAsDate || new Date(inputValue);
      if (isString(maxOutput.value)) {
        exceedMax = valueDate > new Date(maxOutput.value);
      }
      if (isString(minOutput.value)) {
        exceedMin = valueDate < new Date(minOutput.value);
      }
    }

    if (exceedMax || exceedMin) {
      getMinMaxMessage(
        !!exceedMax,
        maxOutput.message,
        minOutput.message,
        INPUT_VALIDATION_RULES.max,
        INPUT_VALIDATION_RULES.min,
      );
      if (!validateAllFieldCriteria) {
        return error;
      }
    }
  }

  if (isString(inputValue) && !isEmpty && (maxLength || minLength)) {
    const maxLengthOutput = getValueAndMessage(maxLength);
    const minLengthOutput = getValueAndMessage(minLength);
    const exceedMax =
      !isNullOrUndefined(maxLengthOutput.value) &&
      inputValue.length > maxLengthOutput.value;
    const exceedMin =
      !isNullOrUndefined(minLengthOutput.value) &&
      inputValue.length < minLengthOutput.value;

    if (exceedMax || exceedMin) {
      getMinMaxMessage(
        exceedMax,
        maxLengthOutput.message,
        minLengthOutput.message,
      );
      if (!validateAllFieldCriteria) {
        return error;
      }
    }
  }

  if (isString(inputValue) && pattern && !isEmpty) {
    const { value: patternValue, message } = getValueAndMessage(pattern);

    if (isRegex(patternValue) && !patternValue.test(inputValue)) {
      error[name] = {
        type: INPUT_VALIDATION_RULES.pattern,
        message,
        ref,
        ...appendErrorsCurry(INPUT_VALIDATION_RULES.pattern, message),
      };
      if (!validateAllFieldCriteria) {
        return error;
      }
    }
  }

  if (validate) {
    const validateRef = isRadioOrCheckbox && refs ? refs[0] : ref;

    if (isFunction(validate)) {
      const result = await validate(inputValue);
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
      let validationResult = {} as FieldError;
      for (const [key, validateFunction] of Object.entries(validate)) {
        if (!isEmptyObject(validationResult) && !validateAllFieldCriteria) {
          break;
        }

        const validateResult = await validateFunction(inputValue);
        const validateError = getValidateError(
          validateResult,
          validateRef,
          key,
        );

        if (validateError) {
          validationResult = {
            ...validateError,
            ...appendErrorsCurry(key, validateError.message),
          };

          if (validateAllFieldCriteria) {
            error[name] = validationResult;
          }
        }
      }

      if (!isEmptyObject(validationResult)) {
        error[name] = {
          ref: validateRef,
          ...validationResult,
        };
        if (!validateAllFieldCriteria) {
          return error;
        }
      }
    }
  }

  return error;
};
