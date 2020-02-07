import { SELECT_MULTIPLE } from '../constants';
import { FieldElement } from '../types';

export default (element?: FieldElement): element is HTMLSelectElement =>
  !!element && element.type === SELECT_MULTIPLE;
