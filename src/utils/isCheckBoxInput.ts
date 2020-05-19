import { FieldElement } from '../types/types';

export default (element: FieldElement): element is HTMLInputElement =>
  element.type === 'checkbox';
