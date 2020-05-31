import isRadioInput from './isRadioInput';
import isCheckBoxInput from './isCheckBoxInput';
import { Ref } from '../types/form';

export default (ref: Ref): ref is HTMLInputElement =>
  isRadioInput(ref) || isCheckBoxInput(ref);
