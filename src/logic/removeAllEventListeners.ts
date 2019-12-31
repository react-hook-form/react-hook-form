import { EVENTS } from '../constants';
import { Ref } from '../types';

export default (ref: Ref, validateWithStateUpdate: Function): void => {
  if (ref.removeEventListener) {
    ref.removeEventListener(EVENTS.INPUT, validateWithStateUpdate);
    ref.removeEventListener(EVENTS.CHANGE, validateWithStateUpdate);
    ref.removeEventListener(EVENTS.BLUR, validateWithStateUpdate);
  }
};
