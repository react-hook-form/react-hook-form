import { EVENTS } from '../constants';
import { Field } from '../types';

export default function attachEventListeners({
  field,
  validateAndStateUpdate,
  isRadioOrCheckbox,
}: {
  field: Field;
  isRadioOrCheckbox: boolean;
  validateAndStateUpdate?: Function;
}): void {
  const { ref } = field;

  if (!ref.addEventListener) {
    return;
  }

  ref.addEventListener(
    isRadioOrCheckbox ? EVENTS.CHANGE : EVENTS.INPUT,
    validateAndStateUpdate,
  );
  ref.addEventListener(EVENTS.BLUR, validateAndStateUpdate);
}
