import { FILE_INPUT } from '../constants';
import { ElementLike, HTMLInputElementLike } from '../types';

export default (element?: ElementLike): element is HTMLInputElementLike =>
  !!element && element.type === FILE_INPUT;
