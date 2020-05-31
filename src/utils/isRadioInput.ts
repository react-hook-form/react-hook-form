import { FieldElement } from '../types/form';

export default (element: FieldElement): element is HTMLInputElement =>
  element.type === 'radio';
