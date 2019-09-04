import isCheckBoxInput from '../utils/isCheckBoxInput';
import { Field } from '../types';

export default function attachEventListeners({
  field,
  validateAndStateUpdate,
  isRadio,
  isOnBlur,
}: {
  field: Field;
  isRadio: boolean;
  validateAndStateUpdate: Function | undefined;
  isOnBlur: boolean;
}): void {
  const { ref } = field;

  if (!ref.addEventListener) return;

  ref.addEventListener(
    isCheckBoxInput(ref.type) || isRadio ? 'change' : 'input',
    validateAndStateUpdate,
  );
  if (isOnBlur) ref.addEventListener('blur', validateAndStateUpdate);
}
