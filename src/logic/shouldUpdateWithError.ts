import isEmptyObject from '../utils/isEmptyObject';
import isSameError from '../utils/isSameError';

export default function shouldUpdateWithError({
  errors,
  name,
  error,
  isOnBlur,
  isBlurEvent,
  isValidateDisabled,
}: {
  errors: any;
  name: string;
  error: any;
  isOnBlur: boolean;
  isBlurEvent: boolean;
  isValidateDisabled: boolean;
}): boolean {
  if (
    isValidateDisabled ||
    (isOnBlur && !isBlurEvent) ||
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
    !isSameError(errors[name], error[name].type, error[name].message)
  );
}
