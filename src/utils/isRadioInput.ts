import { RADIO_INPUT } from '../constants';
import { ElementLike, HTMLInputElementLike } from '../types';

export default (element?: ElementLike): element is HTMLInputElementLike =>
  !!element && element.type === RADIO_INPUT;
