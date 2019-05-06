import { Field } from '../types';
import isCheckBoxInput from '../utils/isCheckBoxInput';

export default function attachEventListeners({
  field,
  validateAndStateUpdate,
  isRadio,
}: {
  field: Field;
  isRadio: boolean;
  validateAndStateUpdate: (any) => void;
}): void {
  const { ref } = field;
  ref.addEventListener(isCheckBoxInput(ref.type) || isRadio ? 'change' : 'input', validateAndStateUpdate);
  ref.addEventListener('blur', validateAndStateUpdate);
}
