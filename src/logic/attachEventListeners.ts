import isHTMLElement from '../utils/isHTMLElement';
import { EVENTS } from '../constants';
import { Field } from '../types/types';

export default function attachEventListeners({
  field: { ref },
  handleChange,
  isRadioOrCheckbox,
}: {
  field: Field;
  isRadioOrCheckbox: boolean;
  handleChange?: EventListenerOrEventListenerObject;
}): void {
  if (isHTMLElement(ref) && handleChange) {
    ref.addEventListener(
      isRadioOrCheckbox ? EVENTS.CHANGE : EVENTS.INPUT,
      handleChange,
    );
    ref.addEventListener(EVENTS.BLUR, handleChange);
  }
}
