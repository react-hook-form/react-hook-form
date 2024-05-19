import { VALIDATION_MODE } from '../constants';
import { Mode, ValidationModeFlags } from '../types';

/**
 * Constructs validation mode flags based on the provided mode.
 * This function returns an object with flags indicating which
 * validation mode is active.
 * @remarks If no mode is provided, it defaults to `onSubmit`.
 *
 * @example
 * const flags = getValidationModeFlags(VALIDATION_MODE.onBlur);
 * Output: { isOnBlur: true, ...<other>false}
 *
 * getValidationModeFlags();
 * Output: { isOnSubmit: true, <other>false}
 */
export default (mode?: Mode): ValidationModeFlags => ({
  isOnSubmit: !mode || mode === VALIDATION_MODE.onSubmit,
  isOnBlur: mode === VALIDATION_MODE.onBlur,
  isOnChange: mode === VALIDATION_MODE.onChange,
  isOnAll: mode === VALIDATION_MODE.all,
  isOnTouch: mode === VALIDATION_MODE.onTouched,
});
