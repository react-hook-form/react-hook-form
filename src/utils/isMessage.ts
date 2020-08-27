import { isValidElement } from 'react';
import isString from '../utils/isString';
import isObject from '../utils/isObject';
import { Message } from '../types';

export default (value: unknown): value is Message =>
  isString(value) || (isObject(value) && isValidElement(value));
