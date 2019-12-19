export default ({
  hasError,
  isBlurEvent,
  isOnSubmit,
  isReValidateOnSubmit,
  isOnBlur,
  isReValidateOnBlur,
  isSubmitted,
}: {
  hasError: boolean;
  isBlurEvent?: boolean;
  isOnSubmit: boolean;
  isReValidateOnSubmit: boolean;
  isOnBlur: boolean;
  isReValidateOnBlur: boolean;
  isSubmitted: boolean;
}) =>
  (isOnSubmit && isReValidateOnSubmit) ||
  (isOnSubmit && !isSubmitted) ||
  (isOnBlur && !isBlurEvent && !isSubmitted && !hasError) ||
  (isReValidateOnBlur && !isBlurEvent && isSubmitted && hasError) ||
  (isReValidateOnSubmit && isSubmitted);
