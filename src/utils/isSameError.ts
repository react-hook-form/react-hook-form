import isObject from './isObject';
import { FieldError, MultipleFieldErrors, ValidateResult } from '../types';
import compareObject from './compareObject';

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
): boolean => {
  return (
    isObject(error) &&
    error.type === type &&
    error.message === message &&
    compareObject(error.types, types)
  );
};
