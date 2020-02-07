import { FieldElement } from '../types';

export default (element?: FieldElement): element is HTMLSelectElement =>
  !!element && element.type === 'select-multiple';
