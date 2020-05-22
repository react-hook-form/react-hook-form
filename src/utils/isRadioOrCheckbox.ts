import isRadioInput from './isRadioInput';
import isCheckBoxInput from './isCheckBoxInput';
import { FieldElement } from '../types/form';

export default (ref: FieldElement): ref is HTMLInputElement =>
  isRadioInput(ref) || isCheckBoxInput(ref);
