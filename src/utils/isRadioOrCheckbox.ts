import isRadioInput from './isRadioInput';
import isCheckBoxInput from './isCheckBoxInput';
import { FieldElement } from '../types';

export default (ref: FieldElement): boolean =>
  isRadioInput(ref) || isCheckBoxInput(ref);
