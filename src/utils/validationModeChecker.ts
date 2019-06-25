import { VALIDATION_MODE } from '../constants';

export default (
  mode?: string,
): {
  isOnSubmit: boolean;
  isOnBlur: boolean;
  isOnChange: boolean;
} => ({
  isOnSubmit: !mode || mode === VALIDATION_MODE.onSubmit,
  isOnBlur: mode === VALIDATION_MODE.onBlur,
  isOnChange: mode === VALIDATION_MODE.onchange,
});
