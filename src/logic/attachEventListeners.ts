import { EVENTS } from '../constants';
import { Field } from '../types';
import isHTMLElement from '../utils/isHTMLElement';

export default function attachEventListeners(
  { ref }: Field['_f'],
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
