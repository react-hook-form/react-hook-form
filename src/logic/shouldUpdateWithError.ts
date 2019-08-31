import isEmptyObject from '../utils/isEmptyObject';
import isSameError from '../utils/isSameError';

export default function shouldUpdateWithError({
  errors,
  name,
  error,
  isValidateDisabled,
}: {
  errors: any;
  name: string;
  error: any;
  isValidateDisabled: boolean;
}): boolean {
  if (
    isValidateDisabled ||
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
