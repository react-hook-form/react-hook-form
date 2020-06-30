import { isValidElement } from 'react';
import isString from '../utils/isString';
import isObject from '../utils/isObject';
import { Message } from '../types/form';
import isFunction from './isFunction';

export default (value: unknown): value is Message => {
  return (
    isString(value) ||
    (isObject(value) && isValidElement(value)) ||
    (isFunction(value) && isString(value()))
  );
};
