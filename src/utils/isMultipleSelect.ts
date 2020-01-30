import { SELECT_MULTIPLE } from '../constants';
import { ElementLike, HTMLSelectElementLike } from '../types';

export default (element?: ElementLike): element is HTMLSelectElementLike =>
  !!element && element.type === SELECT_MULTIPLE;
