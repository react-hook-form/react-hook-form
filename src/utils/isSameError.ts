import isObject from './isObject';
import { FieldError } from '../types';

export default (
  error: FieldError | undefined,
  type: string,
  message: string | undefined,
): boolean =>
  isObject(error) && error.type === type && error.message === message;
