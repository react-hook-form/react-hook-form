export default function shouldUpdateWithError({ errorMessages, name, error, mode, onSubmitModeNotSubmitted, type }) {
  if (onSubmitModeNotSubmitted || (mode === 'onBlur' && type !== 'blur')) {
    return false;
  }

  if (!Object.keys(error).length && !Object.keys(errorMessages).length) {
    return false;
  }

  if (!Object.keys(errorMessages).length && Object.keys(error).length) {
    return true;
  }

  if (!Object.keys(error).length && errorMessages[name]) {
    return true;
  }

  if (Object.keys(error).length) {
    if (!errorMessages[name]) {
      return true;
    } else if (errorMessages[name].type !== error[name].type || errorMessages[name].message !== error[name].message) {
      return true;
    }
  }

  return false;
}
