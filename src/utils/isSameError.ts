import isObject from './isObject';
import { FieldError, ValidateResult } from '../types';

export default (
  error: FieldError | undefined,
  type: string,
  message: ValidateResult,
): boolean =>
  isObject(error) && error.type === type && error.message === message;
