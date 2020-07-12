export default ({
  isOnChange,
  isBlurEvent,
  isOnSubmit,
  isReValidateOnSubmit,
  isOnBlur,
  isReValidateOnBlur,
  isSubmitted,
}: {
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
  (isOnBlur && !isBlurEvent) ||
  (isReValidateOnBlur && !isBlurEvent) ||
  (isReValidateOnSubmit && isSubmitted);
