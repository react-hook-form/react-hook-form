import isRadioInput from './isRadioInput';
import isCheckBoxInput from './isCheckBoxInput';
import { FieldElement } from '../types/types';

export default (ref: FieldElement): ref is HTMLInputElement =>
  isRadioInput(ref) || isCheckBoxInput(ref);
