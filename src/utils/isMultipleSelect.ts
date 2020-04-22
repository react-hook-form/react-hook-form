import isEqual from './isEqual';
import { FieldElement } from '../types';

export default (element: FieldElement): element is HTMLSelectElement =>
  isEqual(element.type, 'select-multiple');
