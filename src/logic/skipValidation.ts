export default ({
  isOnChange,
  hasError,
  isBlurEvent,
  isOnSubmit,
  isReValidateOnSubmit,
  isOnBlur,
  isReValidateOnBlur,
  isSubmitted,
}: {
  hasError: boolean;
  isOnChange: boolean;
  isBlurEvent?: boolean;
  isOnSubmit: boolean;
  isOnBlur: boolean;
  isReValidateOnSubmit: boolean;
  isReValidateOnBlur: boolean;
  isSubmitted: boolean;
}) =>
  (isOnChange && isBlurEvent) ||
  (isOnSubmit && isReValidateOnSubmit) ||
  (isOnSubmit && !isSubmitted) ||
  (isOnBlur && !isBlurEvent && !hasError) ||
  (isReValidateOnBlur && !isBlurEvent && hasError) ||
  (isReValidateOnSubmit && isSubmitted);
