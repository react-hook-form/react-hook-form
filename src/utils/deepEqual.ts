import isObject from '../utils/isObject';

export default function deepEqual(
  object1: any = [],
  object2: any = [],
  isErrorObject?: boolean,
) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!(isErrorObject && ['ref', 'context'].includes(key))) {
      const val1 = object1[key];
      const val2 = object2[key];

      if (
        (isObject(val1) || Array.isArray(val1)) &&
        (isObject(val2) || Array.isArray(val2))
          ? !deepEqual(val1, val2, isErrorObject)
          : val1 !== val2
      ) {
        return false;
      }
    }
  }

  return true;
}
