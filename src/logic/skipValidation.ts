export default ({
  isOnBlur,
  isOnChange,
  isReValidateOnBlur,
  isReValidateOnChange,
  isBlurEvent,
  isSubmitted,
}: {
  isOnBlur: boolean;
  isOnChange: boolean;
  isReValidateOnBlur: boolean;
  isReValidateOnChange: boolean;
  isBlurEvent?: boolean;
  isSubmitted: boolean;
}) => {
  if (isSubmitted ? isReValidateOnBlur : isOnBlur) {
    return !isBlurEvent;
  } else if (isSubmitted ? isReValidateOnChange : isOnChange) {
    return isBlurEvent;
  }
  return true;
};
