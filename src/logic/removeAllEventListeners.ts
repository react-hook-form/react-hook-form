import isHTMLElement from '../utils/isHTMLElement';
import { EVENTS } from '../constants';
import { Ref } from '../types/form';

export default (
  ref: Ref,
  validateWithStateUpdate: EventListenerOrEventListenerObject,
): void => {
  if (isHTMLElement(ref) && ref.removeEventListener) {
    ref.removeEventListener(EVENTS.INPUT, validateWithStateUpdate);
    ref.removeEventListener(EVENTS.CHANGE, validateWithStateUpdate);
    ref.removeEventListener(EVENTS.BLUR, validateWithStateUpdate);
  }
};
