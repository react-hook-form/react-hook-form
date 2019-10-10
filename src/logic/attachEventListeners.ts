import isCheckBoxInput from '../utils/isCheckBoxInput';
import { BLUR, CHANGE, INPUT } from '../constants';
import { Field } from '../types';

export default function attachEventListeners({
  field,
  validateAndStateUpdate,
  isRadio,
  isOnBlur,
  isReValidateOnBlur,
}: {
  field: Field;
  isRadio: boolean;
  validateAndStateUpdate?: Function;
  isOnBlur: boolean;
  isReValidateOnBlur: boolean;
}): void {
  const { ref } = field;

  if (!ref.addEventListener) return;

  ref.addEventListener(
    isCheckBoxInput(ref.type) || isRadio ? CHANGE : INPUT,
    validateAndStateUpdate,
  );
  if (isOnBlur || isReValidateOnBlur)
    ref.addEventListener(BLUR, validateAndStateUpdate);
}
