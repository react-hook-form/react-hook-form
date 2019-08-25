import { VALIDATION_MODE } from '../constants';
import { ValidationModes } from '../types';

export default (
  mode?: ValidationModes,
): {
  isOnSubmit: boolean;
  isOnBlur: boolean;
  isOnChange: boolean;
} => ({
  isOnSubmit: !mode || mode === VALIDATION_MODE.onSubmit,
  isOnBlur: mode === VALIDATION_MODE.onBlur,
  isOnChange: mode === VALIDATION_MODE.onChange,
});
