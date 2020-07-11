import isObject from './isObject';
import compareObject from './compareObject';
import { FieldError } from '../types/form';

export default (
  error: FieldError | undefined,
  { types }: FieldError,
): boolean => isObject(error) && compareObject(error.types, types);
