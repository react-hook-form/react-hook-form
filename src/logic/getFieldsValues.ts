import getFieldValue from './getFieldValue';
import { FieldValue, Ref } from '../types';
import isString from "../utils/isString";

export default function getFieldsValues(fields, filedName?: string | string[]): FieldValue {
  return Object.values(fields).reduce((previous, data: Ref): FieldValue => {
    const {
      ref,
      ref: { name },
    } = data;
    const value = getFieldValue(fields, ref);

    if (isString(filedName)) {
      if (name === filedName) {
        return value;
      }

      return previous;
    }

    const copy = { ...(previous || {}) };
    if (Array.isArray(filedName)) {
      if (filedName.includes(name)) {
        copy[name] = value;
      }
    } else {
      copy[name] = value;
    }

    return copy;
  }, {});
}
