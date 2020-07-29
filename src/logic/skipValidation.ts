export default ({
  isOnBlur,
  isOnChange,
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
}) => {
  if (isOnAll) {
    return false;
  } else if (isSubmitted ? isReValidateOnBlur : isOnBlur) {
    return !isBlurEvent;
  } else if (isSubmitted ? isReValidateOnChange : isOnChange) {
    return isBlurEvent;
  }
  return true;
};
