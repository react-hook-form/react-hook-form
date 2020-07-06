import isObject from './isObject';
import compareObject from './compareObject';
import { Error } from '../types/form';

export default (
  error: Error | undefined,
  { type, types, message }: Error,
): boolean =>
  isObject(error) &&
  error.type === type &&
  error.message === message &&
  compareObject(error.types, types);
