export default ({
  isOnBlur,
  isOnChange,
  isOnTouch,
  isTouched,
  isReValidateOnBlur,
  isReValidateOnChange,
  isBlurEvent,
  isSubmitted,
}: {
  isOnBlur: boolean;
  isOnChange: boolean;
  isOnTouch: boolean;
  isReValidateOnBlur: boolean;
  isReValidateOnChange: boolean;
  isBlurEvent?: boolean;
  isSubmitted: boolean;
  isTouched: boolean;
}) => {
  if (isSubmitted && isOnTouch) {
    return !isTouched;
  } else if (isSubmitted ? isReValidateOnBlur : isOnBlur) {
    return !isBlurEvent;
  } else if (isSubmitted ? isReValidateOnChange : isOnChange) {
    return isBlurEvent;
  }
  return true;
};
