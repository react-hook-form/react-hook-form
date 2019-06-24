import isString from "../utils/isString";
import {Ref} from "../types";

export default function displayNativeError(nativeValidation: boolean, ref: Ref, result: string) {
  if (nativeValidation && isString(result)) ref.setCustomValidity(result);
}
