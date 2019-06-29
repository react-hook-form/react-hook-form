import isString from '../utils/isString';
import { Ref } from '../types';

export default function displayNativeError(
  nativeValidation: boolean,
  ref: Ref,
  message: string,
) {
  if (nativeValidation && isString(message)) ref.setCustomValidity(message);
}
