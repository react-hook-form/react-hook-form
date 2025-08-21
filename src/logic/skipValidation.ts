import type { ValidationModeFlags } from '../types';

export default (
  isBlurEvent: boolean,
  isTouched: boolean,
  isSubmitted: boolean,
  reValidateMode: {
    isOnBlur: boolean;
    isOnChange: boolean;
  },
  mode: Partial<ValidationModeFlags>,
  /**
   * Need to keep this order of parameters for backward compatibility
   */
  isFocusEvent: boolean,
) => {
  // Focus events should always skip validation
  if (isFocusEvent) {
    return true;
  }

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
