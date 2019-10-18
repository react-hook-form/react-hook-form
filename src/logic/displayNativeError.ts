import isString from '../utils/isString';
import { Ref } from '../types';

export default (nativeValidation: boolean, ref: Ref, message: string): void => {
  if (nativeValidation && isString(message)) {
    ref.setCustomValidity(message);
  }
};
