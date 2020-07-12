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
import isBoolean from '../utils/isBoolean';
import isMessage from '../utils/isMessage';
import getValidateError from './getValidateError';
import appendErrors from './appendErrors';
import { INPUT_VALIDATION_RULES } from '../constants';
import {
  Field,
  FieldValues,
  FieldRefs,
  Message,
  FieldError,
  InternalFieldName,
  FlatFieldErrors,
} from '../types/form';

export default async <TFieldValues extends FieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  validateAllFieldCriteria: boolean,
  {
    ref,
    ref: { type, value },
    options,
    required,
    maxLength,
    minLength,
    min,
    max,
    pattern,
    validate,
  }: Field,
  unmountFieldsStateRef: React.MutableRefObject<Record<string, any>>,
): Promise<FlatFieldErrors<TFieldValues>> => {
  const fields = fieldsRef.current;
  const name: InternalFieldName<TFieldValues> = ref.name;
  const error: FlatFieldErrors<TFieldValues> = {};
  const isRadio = isRadioInput(ref);
  const isCheckBox = isCheckBoxInput(ref);
  const isRadioOrCheckbox = isRadio || isCheckBox;
  const isEmpty = value === '';
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
    ((!isRadio && !isCheckBox && (isEmpty || isNullOrUndefined(value))) ||
      (isBoolean(value) && !value) ||
      (isCheckBox && !getCheckboxValue(options).isValid) ||
      (isRadio && !getRadioValue(options).isValid))
  ) {
    const { value: requiredValue, message: requiredMessage } = isMessage(
      required,
    )
      ? { value: !!required, message: required }
      : getValueAndMessage(required);

    if (requiredValue) {
      error[name] = {
        type: INPUT_VALIDATION_RULES.required,
        message: requiredMessage,
        ref: isRadioOrCheckbox ? (fields[name] as Field).options?.[0].ref : ref,
        ...appendErrorsCurry(INPUT_VALIDATION_RULES.required, requiredMessage),
      };
      if (!validateAllFieldCriteria) {
        return error;
      }
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
    const exceedMax =
      !isNullOrUndefined(maxLengthValue) && inputLength > maxLengthValue;
    const exceedMin =
      !isNullOrUndefined(minLengthValue) && inputLength < minLengthValue;

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
    const fieldValue = getFieldsValue(fieldsRef, name, unmountFieldsStateRef);
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
      let validationResult = {} as FieldError;
      for (const [key, validateFunction] of Object.entries(validate)) {
        if (!isEmptyObject(validationResult) && !validateAllFieldCriteria) {
          break;
        }

        const validateResult = await validateFunction(fieldValue);
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
