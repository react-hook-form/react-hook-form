import * as React from 'react';
import isString from '../utils/isString';
import { Message } from '../types';

export default (value: unknown): value is Message =>
  isString(value) || React.isValidElement(value as JSX.Element);
