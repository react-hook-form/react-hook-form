import isObject from './isObject';
import { EmptyObject } from './../types';

export default (value: unknown): value is EmptyObject =>
  isObject(value) && !Object.keys(value).length;
