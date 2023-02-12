import { FieldElement } from '..';

export default (element: FieldElement): element is HTMLInputElement =>
  element.type === 'checkbox';
