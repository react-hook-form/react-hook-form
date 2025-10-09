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
  /**
   * Optional field-level validation mode that overrides form-level mode
   */
  fieldMode?: Partial<ValidationModeFlags>,
  /**
   * Optional field-level revalidation mode that overrides form-level reValidateMode
   */
  fieldReValidateMode?: {
    isOnBlur: boolean;
    isOnChange: boolean;
  },
) => {
  // Use field-level modes if provided, otherwise fallback to form-level modes
  const effectiveMode = fieldMode || mode;
  const effectiveReValidateMode = fieldReValidateMode || reValidateMode;

  // Focus events should always skip validation
  if (isFocusEvent) {
    return true;
  }

  if (effectiveMode.isOnAll) {
    return false;
  } else if (!isSubmitted && effectiveMode.isOnTouch) {
    return !(isTouched || isBlurEvent);
  } else if (
    isSubmitted ? effectiveReValidateMode.isOnBlur : effectiveMode.isOnBlur
  ) {
    return !isBlurEvent;
  } else if (
    isSubmitted ? effectiveReValidateMode.isOnChange : effectiveMode.isOnChange
  ) {
    return isBlurEvent;
  }
  return true;
};
