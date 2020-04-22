import isObject from './isObject';
import isEqual from './isEqual';
import compareObject from './compareObject';
import { FieldError, MultipleFieldErrors, ValidateResult } from '../types';

export default (
  error: FieldError | undefined,
  {
    type,
    types,
    message,
  }: {
    type: string;
    types?: MultipleFieldErrors;
    message: ValidateResult;
  },
): boolean =>
  isObject(error) &&
  isEqual(error.type, type) &&
  isEqual(error.message, message) &&
  compareObject(error.types, types);
