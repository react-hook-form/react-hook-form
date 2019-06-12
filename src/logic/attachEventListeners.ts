import { Field } from '../types';
import isCheckBoxInput from '../utils/isCheckBoxInput';

export default function attachEventListeners({
  isOnBlurMode,
  field,
  validateAndStateUpdate,
  isRadio,
}: {
  isOnBlurMode: boolean;
  field: Field;
  isRadio: boolean;
  validateAndStateUpdate: Function | undefined;
}): void {
  const { ref } = field;
  if (!ref.addEventListener) return;
  if (!isOnBlurMode)
    ref.addEventListener(
      isCheckBoxInput(ref.type) || isRadio ? 'change' : 'input', validateAndStateUpdate
    );
  ref.addEventListener('blur', validateAndStateUpdate);
}
