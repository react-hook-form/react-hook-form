import { SELECT } from '../constants';
import { FieldElement } from '../types';

export default (element: FieldElement): element is HTMLSelectElement =>
  element.type === `${SELECT}-one`;
