import { FieldElement } from '..';

export default (element: FieldElement): element is HTMLSelectElement =>
  element.type === `select-multiple`;
