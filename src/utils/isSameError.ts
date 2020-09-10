import isObject from './isObject';
import { FieldError } from '../types';

export default (error: FieldError, currentError?: FieldError): boolean =>
  isObject(error) &&
  isObject(currentError) &&
  error.type === currentError.type &&
  error.message === currentError.message &&
  Object.keys(error.types || {}).length ===
    Object.keys(currentError.types || {}).length &&
  Object.entries(error.types || {}).every(
    ([key, value]) => (currentError.types || {})[key] === value,
  );
