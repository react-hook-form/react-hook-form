import { BLUR, CHANGE, INPUT } from '../constants';
import { Ref } from '../types';

export default (ref: Ref, validateWithStateUpdate: Function): void => {
  if (!ref.removeEventListener) return;
  ref.removeEventListener(INPUT, validateWithStateUpdate);
  ref.removeEventListener(CHANGE, validateWithStateUpdate);
  ref.removeEventListener(BLUR, validateWithStateUpdate);
};
