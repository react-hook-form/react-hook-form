import { FieldElement } from '../types/types';
import { SELECT } from '../constants';

export default (element: FieldElement): element is HTMLSelectElement =>
  element.type === `${SELECT}-one`;
