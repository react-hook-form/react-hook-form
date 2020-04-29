import isEmptyObject from '../utils/isEmptyObject';
import { DataType } from '../types';

export default function shouldUpdateWithError({
  errors,
  name,
  error,
  isOnBlur,
  isBlurType,
  isValidateDisabled,
}: {
  errors: DataType;
  name: string;
  error: any;
  isOnBlur: boolean;
  isBlurType: boolean;
  isValidateDisabled: boolean;
}): boolean {
  if (
    isValidateDisabled ||
    (isOnBlur && !isBlurType) ||
    (isEmptyObject(error) && isEmptyObject(errors)) ||
    (errors[name] && errors[name].isManual)
  ) {
    return false;
  }

  if (
    (isEmptyObject(errors) && !isEmptyObject(error)) ||
    (isEmptyObject(error) && errors[name]) ||
    !errors[name]
  ) {
    return true;
  }

  return (
    errors[name] &&
    error[name] &&
    (errors[name].type !== error[name].type ||
      errors[name].message !== error[name].message)
  );
}
