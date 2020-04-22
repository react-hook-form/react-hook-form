import isEqual from './isEqual';
import { FieldElement } from '../types';

export default (element: FieldElement): element is HTMLInputElement =>
  isEqual(element.type, 'checkbox');
