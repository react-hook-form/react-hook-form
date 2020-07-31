export default ({
  isOnBlur,
  isOnChange,
  isOnTouch,
  isTouched,
  isReValidateOnBlur,
  isReValidateOnChange,
  isBlurEvent,
  isSubmitted,
  isOnAll,
}: {
  isOnAll?: boolean;
  isOnBlur?: boolean;
  isOnChange?: boolean;
  isReValidateOnBlur?: boolean;
  isReValidateOnChange?: boolean;
  isBlurEvent?: boolean;
  isSubmitted?: boolean;
  isOnTouch?: boolean;
  isTouched?: boolean;
}) => {
  if (isOnAll) {
    return false;
  } else if (!isSubmitted && isOnTouch) {
    return !(isTouched || isBlurEvent);
  } else if (isSubmitted ? isReValidateOnBlur : isOnBlur) {
    return !isBlurEvent;
  } else if (isSubmitted ? isReValidateOnChange : isOnChange) {
    return isBlurEvent;
  }
  return true;
};
