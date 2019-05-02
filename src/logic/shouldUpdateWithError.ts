export default function shouldUpdateWithError({ errors, name, error, mode, onSubmitModeNotSubmitted, type }): boolean {
  if (onSubmitModeNotSubmitted || (mode === 'onBlur' && type !== 'blur')) {
    return false;
  }

  if (!Object.keys(error).length && !Object.keys(errors).length) {
    return false;
  }

  if (!Object.keys(errors).length && Object.keys(error).length) {
    return true;
  }

  if (!Object.keys(error).length && errors[name]) {
    return true;
  }

  if (Object.keys(error).length) {
    if (!errors[name]) {
      return true;
    } else if (errors[name].type !== error[name].type || errors[name].message !== error[name].message) {
      return true;
    }
  }

  return false;
}
