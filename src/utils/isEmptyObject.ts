import isObject from './isObject';
import { EmptyObject } from '../types/utils';

export default (value: unknown): value is EmptyObject =>
  isObject(value) && !Object.keys(value).length;
