import type { ValidationModeFlags } from '../types';

/**
 * Subset of ValidationModeFlags used for revalidation mode checking
 */
type ReValidateModeFlags = Pick<ValidationModeFlags, 'isOnBlur' | 'isOnChange'>;

export default (
  isBlurEvent: boolean,
  isTouched: boolean,
  isSubmitted: boolean,
  reValidateMode: ReValidateModeFlags,
  mode: Partial<ValidationModeFlags>,
  /**
   * Need to keep this order of parameters for backward compatibility
   */
  isFocusEvent: boolean,
  /**
   * Optional field-level validation mode that overrides form-level mode.
   * When provided, this field's mode takes precedence over the form's mode.
   * Partial because only the relevant flags (e.g., isOnChange, isOnBlur) need to be checked.
   */
  fieldMode?: Partial<ValidationModeFlags>,
  /**
   * Optional field-level revalidation mode that overrides form-level reValidateMode.
   * When provided, this field's reValidateMode takes precedence after form submission.
   * Only includes isOnBlur and isOnChange as these are the only valid revalidation modes.
   */
  fieldReValidateMode?: ReValidateModeFlags,
) => {
  // Use field-level modes if provided, otherwise fallback to form-level modes
  // This allows individual fields to have different validation timing than the form
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
