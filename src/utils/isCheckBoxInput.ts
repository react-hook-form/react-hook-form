import { CHECKBOX_INPUT } from '../constants';
import { ElementLike, HTMLInputElementLike } from '../types';

export default (element?: ElementLike): element is HTMLInputElementLike =>
  !!element && element.type === CHECKBOX_INPUT;
