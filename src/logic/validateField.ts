import getRadioValue from './getRadioValue';
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
import getValidateFunctionErrorObject from './getValidateFunctionErrorObject';
import appendErrors from './appendErrors';
import {
  PATTERN_ATTRIBUTE,
  RADIO_INPUT,
  REQUIRED_ATTRIBUTE,
} from '../constants';
import {
  Field,
  FieldErrors,
  FieldValues,
  FieldName,
  ValidatePromiseResult,
} from '../types';

export default async <FormValues extends FieldValues>(
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
  returnSingleError = true,
): Promise<FieldErrors<FormValues>> => {
  const error: FieldErrors<FormValues> = {};
  const isRadio = isRadioInput(type);
  const isCheckBox = isCheckBoxInput(type);
  const nativeError = displayNativeError.bind(null, nativeValidation, ref);
  const typedName = name as FieldName<FormValues>;

  if (
    required &&
    ((isCheckBox && !checked) ||
      (!isCheckBox && !isRadio && value === '') ||
      (isRadio && !getRadioValue(fields[typedName].options).isValid) ||
      (type !== RADIO_INPUT && isNullOrUndefined(value)))
  ) {
    const message = isString(required) ? required : '';

    error[typedName] = {
      type: REQUIRED_ATTRIBUTE,
      message,
      ref: isRadio ? fields[typedName].options[0].ref : ref,
      ...appendErrors(typedName, returnSingleError, error, 'required', message),
    };
    nativeError(required);
    if (returnSingleError) {
      return error;
    }
  }

  if (!isNullOrUndefined(min) || !isNullOrUndefined(max)) {
    let exceedMax;
    let exceedMin;
    const { value: maxValue, message: maxMessage } = getValueAndMessage(max);
    const { value: minValue, message: minMessage } = getValueAndMessage(min);

    if (type === 'number') {
      const valueNumber = parseFloat(value);
      if (!isNullOrUndefined(maxValue)) {
        exceedMax = valueNumber > maxValue;
      }
      if (!isNullOrUndefined(minValue)) {
        exceedMin = valueNumber < minValue;
      }
    } else {
      if (isString(maxValue)) {
        exceedMax = new Date(value) > new Date(maxValue);
      }
      if (isString(minValue)) {
        exceedMin = new Date(value) < new Date(minValue);
      }
    }

    if (exceedMax || exceedMin) {
      const message = exceedMax ? maxMessage : minMessage;
      error[typedName] = {
        type: exceedMax ? 'max' : 'min',
        message,
        ref,
        ...(exceedMax
          ? appendErrors(typedName, returnSingleError, error, 'max', message)
          : {}),
        ...(!exceedMax
          ? appendErrors(typedName, returnSingleError, error, 'min', message)
          : {}),
      };
      nativeError(message);
      if (returnSingleError) {
        return error;
      }
    }
  }

  if ((maxLength || minLength) && isString(value)) {
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
      error[typedName] = {
        type: exceedMax ? 'maxLength' : 'minLength',
        message,
        ref,
        ...(exceedMax
          ? appendErrors(
              typedName,
              returnSingleError,
              error,
              'maxLength',
              message,
            )
          : {}),
        ...(!exceedMax
          ? appendErrors(
              typedName,
              returnSingleError,
              error,
              'minLength',
              message,
            )
          : {}),
      };
      nativeError(message);
      if (returnSingleError) {
        return error;
      }
    }
  }

  if (pattern) {
    const { value: patternValue, message: patternMessage } = getValueAndMessage(
      pattern,
    );

    if (isRegex(patternValue) && !patternValue.test(value)) {
      error[typedName] = {
        type: PATTERN_ATTRIBUTE,
        message: patternMessage,
        ref,
        ...appendErrors(
          typedName,
          returnSingleError,
          error,
          'pattern',
          patternMessage,
        ),
      };
      nativeError(patternMessage);
      if (returnSingleError) {
        return error;
      }
    }
  }

  if (validate) {
    const fieldValue = getFieldsValue(fields, ref);
    const validateRef = isRadio && options ? options[0].ref : ref;

    if (isFunction(validate)) {
      const result = await validate(fieldValue);
      const errorObject = getValidateFunctionErrorObject(
        result,
        validateRef,
        nativeError,
      );

      if (errorObject) {
        error[typedName] = {
          ...errorObject,
          ...appendErrors(
            typedName,
            returnSingleError,
            error,
            'validate',
            errorObject.message,
          ),
        };
        if (returnSingleError) {
          return error;
        }
      }
    } else if (isObject(validate)) {
      const validationResult = await new Promise(
        (resolve): ValidatePromiseResult => {
          const values = Object.entries(validate);
          values.reduce(async (previous, [key, validate], index): Promise<
            ValidatePromiseResult
          > => {
            if (!isEmptyObject(await previous) && returnSingleError) {
              return resolve(previous);
            }
            const lastChild = values.length - 1 === index;

            if (isFunction(validate)) {
              const result = await validate(fieldValue);
              const errorObject = getValidateFunctionErrorObject(
                result,
                validateRef,
                nativeError,
                key,
              );

              if (errorObject) {
                const output = {
                  ...errorObject,
                  ...appendErrors(
                    typedName,
                    returnSingleError,
                    error,
                    key,
                    errorObject.message,
                  ),
                };

                if (!returnSingleError) {
                  error[typedName] = output;
                }

                return lastChild ? resolve(output) : output;
              }
            }

            return lastChild ? resolve(previous) : previous;
          }, {});
        },
      );

      if (!isEmptyObject(validationResult)) {
        error[typedName] = {
          ref: validateRef,
          ...(validationResult as { type: string; message?: string }),
        };
        if (returnSingleError) {
          return error;
        }
      }
    }
  }

  if (nativeValidation) {
    ref.setCustomValidity('');
  }

  return error;
};
