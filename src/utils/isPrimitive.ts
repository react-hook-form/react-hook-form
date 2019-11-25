import isNullOrUndefined from './isNullOrUndefined';
import { Primitive } from '../types';

export default (value: unknown): value is Primitive =>
  isNullOrUndefined(value) || typeof value !== 'object';
