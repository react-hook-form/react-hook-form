import isString from "../utils/isString";

export default function displayNativeError(nativeValidation, ref, result) {
  if (nativeValidation && isString(result)) ref.setCustomValidity(result);
}
