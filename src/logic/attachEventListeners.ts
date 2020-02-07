import isHTMLElement from '../utils/isHTMLElement';
import { EVENTS } from '../constants';
import { Field } from '../types';

export default function attachEventListeners({
  field,
  handleChange,
  isRadioOrCheckbox,
}: {
  field: Field;
  isRadioOrCheckbox: boolean;
  handleChange?: EventListenerOrEventListenerObject;
}): void {
  const { ref } = field;

  if (isHTMLElement(ref) && ref.addEventListener && handleChange) {
    ref.addEventListener(
      isRadioOrCheckbox ? EVENTS.CHANGE : EVENTS.INPUT,
      handleChange,
    );
    ref.addEventListener(EVENTS.BLUR, handleChange);
  }
}
