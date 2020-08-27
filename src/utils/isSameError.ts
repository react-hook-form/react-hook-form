import isObject from './isObject';
import { FieldError } from '../types';

export default (
  error: FieldError | undefined,
  { type, types = {}, message }: FieldError,
): boolean =>
  isObject(error) &&
  error.type === type &&
  error.message === message &&
  Object.keys(error.types || {}).length === Object.keys(types).length &&
  Object.entries(error.types || {}).every(
    ([key, value]) => types[key] === value,
  );
