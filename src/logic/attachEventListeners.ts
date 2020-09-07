import isHTMLElement from '../utils/isHTMLElement';
import { EVENTS } from '../constants';
import { Field } from '../types';

export default function attachEventListeners(
  { ref }: Field,
  shouldAttachChangeEvent?: boolean,
  handleChange?: EventListenerOrEventListenerObject,
): void {
  if (isHTMLElement(ref) && handleChange) {
    ref.addEventListener(
      shouldAttachChangeEvent ? EVENTS.CHANGE : EVENTS.INPUT,
      handleChange,
    );
    ref.addEventListener(EVENTS.BLUR, handleChange);
  }
}
