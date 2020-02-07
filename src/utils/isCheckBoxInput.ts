import { FieldElement } from '../types';

export default (element?: FieldElement): element is HTMLInputElement =>
  !!element && element.type === 'checkbox';
