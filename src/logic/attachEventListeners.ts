import isCheckBoxInput from '../utils/isCheckBoxInput';
import { Field } from '../types';

export default function attachEventListeners({
  field,
  validateAndStateUpdate,
  isRadio,
}: {
  field: Field;
  isRadio: boolean;
  validateAndStateUpdate: Function | undefined;
}): void {
  const { ref } = field;
  if (!ref.addEventListener) return;
  ref.addEventListener(
    isCheckBoxInput(ref.type) || isRadio ? 'change' : 'input',
    validateAndStateUpdate,
  );
  ref.addEventListener('blur', validateAndStateUpdate);
}
