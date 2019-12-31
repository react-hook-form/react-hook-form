import { EVENTS } from '../constants';
import { Field } from '../types';

export default function attachEventListeners({
  field,
  handleChange,
  isRadioOrCheckbox,
}: {
  field: Field;
  isRadioOrCheckbox: boolean;
  handleChange?: Function;
}): void {
  const { ref } = field;

  ref.addEventListener(
    isRadioOrCheckbox ? EVENTS.CHANGE : EVENTS.INPUT,
    handleChange,
  );
  ref.addEventListener(EVENTS.BLUR, handleChange);
}
