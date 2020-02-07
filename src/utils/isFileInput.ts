import { FILE_INPUT } from '../constants';
import { FieldElement } from '../types';

export default (element?: FieldElement): element is HTMLInputElement =>
  !!element && element.type === FILE_INPUT;
