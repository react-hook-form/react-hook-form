import { FieldPath, FieldValues } from '../types';

import isKey from './isKey';
import isObject from './isObject';
import stringToPath from './stringToPath';

export default (props: {
  object: FieldValues;
  name: FieldPath<FieldValues>;
  value?: unknown;
}) => {
  let object = props.object;
  let index = -1;
  const tempPath = isKey(props.name) ? [props.name] : stringToPath(props.name);
  const length = tempPath.length;
  const lastIndex = length - 1;

  while (++index < length) {
    const key = tempPath[index];
    let newValue = props.value;

    if (index !== lastIndex) {
      const objValue = object[key];
      newValue =
        isObject(objValue) || Array.isArray(objValue)
          ? objValue
          : !isNaN(+tempPath[index + 1])
            ? []
            : {};
    }

    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return;
    }

    object[key] = newValue;
    object = object[key];
  }

  return object;
};
