import isEmptyObject from '../utils/isEmptyObject';

export default function shouldUpdateWithError({
  errors,
  name,
  error,
  isOnBlur,
  onSubmitModeNotSubmitted,
  type,
}): boolean {
  if (onSubmitModeNotSubmitted || (isOnBlur && type !== 'blur')) {
    return false;
  }

  if (errors[name] && errors[name].isManual && errors[name].type) {
    return false;
  }

  if (isEmptyObject(error) && isEmptyObject(errors)) {
    return false;
  }

  if (isEmptyObject(errors) && !isEmptyObject(error)) {
    return true;
  }

  if (isEmptyObject(error) && errors[name]) {
    return true;
  }

  if (!isEmptyObject(error)) {
    if (!errors[name]) {
      return true;
    } else if (errors[name].type !== error[name].type || errors[name].message !== error[name].message) {
      return true;
    }
  }

  return false;
}
