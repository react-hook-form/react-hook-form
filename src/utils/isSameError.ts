import { FieldError } from '../types';
import isObject from './isObject';

export default (
  error: FieldError | undefined,
  type: string,
  message: string | undefined,
): boolean =>
  isObject(error) && (error.type === type && error.message === message);
