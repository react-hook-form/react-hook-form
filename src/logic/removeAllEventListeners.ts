import { Ref } from '../types';

export default (ref: Ref, validateWithStateUpdate: Function): void => {
  if (!ref.removeEventListener) return;
  ref.removeEventListener('input', validateWithStateUpdate);
  ref.removeEventListener('change', validateWithStateUpdate);
  ref.removeEventListener('blur', validateWithStateUpdate);
};
