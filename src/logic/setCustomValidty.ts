import isBoolean from '../utils/isBoolean';

export default (
  inputRef: HTMLInputElement,
  nativeValidation?: boolean,
  message?: string | boolean,
) => {
  if (nativeValidation && inputRef.reportValidity) {
    inputRef.setCustomValidity(isBoolean(message) ? '' : message || ' ');
    inputRef.reportValidity();
  }
};
