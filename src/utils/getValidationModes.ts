import { VALIDATION_MODE } from '../constants';
import { Mode } from '../types';

export default (
  mode?: Mode,
): {
  isOnSubmit: boolean;
  isOnBlur: boolean;
  isOnChange: boolean;
  isOnAll: boolean;
  isOnTouch: boolean;
} => ({
  isOnSubmit: !mode || mode === VALIDATION_MODE.onSubmit,
  isOnBlur: mode === VALIDATION_MODE.onBlur,
  isOnChange: mode === VALIDATION_MODE.onChange,
  isOnAll: mode === VALIDATION_MODE.all,
  isOnTouch: mode === VALIDATION_MODE.onTouched,
});
