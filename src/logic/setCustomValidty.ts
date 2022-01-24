import isBoolean from '../utils/isBoolean';

export default (
  inputRef: HTMLInputElement,
  shouldUseNativeValidation?: boolean,
  message?: string | boolean,
) => {
  if (shouldUseNativeValidation && inputRef.reportValidity) {
    inputRef.setCustomValidity(isBoolean(message) ? '' : message || ' ');
    inputRef.reportValidity();
  }
};
