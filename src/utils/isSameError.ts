import isObject from './isObject';
import compareObject from './compareObject';
import { FieldError } from '../types';

export default (
  error: FieldError | undefined,
  { type, types, message }: FieldError,
): boolean =>
  isObject(error) &&
  error.type === type &&
  error.message === message &&
  compareObject(error.types, types);
