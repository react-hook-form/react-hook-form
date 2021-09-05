export default (
  isBlurEvent: boolean,
  isTouched: boolean,
  isSubmitted: boolean,
  reValidateMode: {
    isOnBlur: boolean;
    isOnChange: boolean;
  },
  mode: Partial<{
    isOnSubmit: boolean;
    isOnBlur: boolean;
    isOnChange: boolean;
    isOnTouch: boolean;
    isOnAll: boolean;
  }>,
) => {
  if (mode.isOnAll) {
    return false;
  } else if (!isSubmitted && mode.isOnTouch) {
    return !(isTouched || isBlurEvent);
  } else if (isSubmitted ? reValidateMode.isOnBlur : mode.isOnBlur) {
    return !isBlurEvent;
  } else if (isSubmitted ? reValidateMode.isOnChange : mode.isOnChange) {
    return isBlurEvent;
  }
  return true;
};
