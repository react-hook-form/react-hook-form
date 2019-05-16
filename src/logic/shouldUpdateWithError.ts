import isEmptyObject from '../utils/isEmptyObject';

export default function shouldUpdateWithError({
  errors,
  name,
  error,
  isOnBlur,
  isBlurType,
  onSubmitModeNotSubmitted,
}): boolean {
  if (
    onSubmitModeNotSubmitted ||
    (isOnBlur && !isBlurType) ||
    (errors[name] && errors[name].isManual && errors[name].type) ||
    (isEmptyObject(error) && isEmptyObject(errors))
  ) {
    return false;
  }

  if ((isEmptyObject(errors) && !isEmptyObject(error)) || (isEmptyObject(error) && errors[name])) {
    return true;
  }

  if (!errors[name]) {
    return true;
  } else if (errors[name].type !== error[name].type || errors[name].message !== error[name].message) {
    return true;
  }

  return false;
}
