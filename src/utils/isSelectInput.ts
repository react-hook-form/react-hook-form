import { FieldElement } from '../types/form';
import { SELECT } from '../constants';

export default (element: FieldElement): element is HTMLSelectElement =>
  element.type === `${SELECT}-one`;
