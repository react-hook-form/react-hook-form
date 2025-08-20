import React from 'react';

import type { Message } from '../types';
import isString from '../utils/isString';

export default (value: unknown): value is Message => {
  // Support strings (existing functionality)
  if (isString(value)) {
    return true;
  }

  // Support React elements only (not primitives like null, undefined, numbers)
  if (React.isValidElement(value)) {
    return true;
  }

  return false;
};
