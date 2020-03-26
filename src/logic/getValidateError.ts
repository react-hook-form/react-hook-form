import * as React from 'react';
import isString from '../utils/isString';
import isBoolean from '../utils/isBoolean';
import { FieldError, ValidateResult, Ref, Message } from '../types';

export default function getValidateError(
  result: ValidateResult,
  ref: Ref,
  type = 'validate',
): FieldError | void {
  const isMessage = (value: any): value is Message =>
    isString(value) || React.isValidElement(value);

  if (isMessage(result) || (isBoolean(result) && !result)) {
    const message = isMessage(result) ? result : '';
    return {
      type,
      message,
      ref,
    };
  }
}
