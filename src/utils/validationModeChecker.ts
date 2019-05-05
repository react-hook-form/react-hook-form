import { VALIDATION_MODE } from '../constants';

export default function modeChecker(
  mode,
): {
  isOnSubmit: boolean;
  isOnBlur: boolean;
  isOnChange: boolean;
} {
  return {
    isOnSubmit: mode === VALIDATION_MODE.onSubmit,
    isOnBlur: mode === VALIDATION_MODE.onBlur,
    isOnChange: mode === VALIDATION_MODE.onchange,
  };
}
