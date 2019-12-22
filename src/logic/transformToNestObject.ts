import set from '../utils/set';
import isObjectString from '../utils/isObjectString';
import isArray from '../utils/isArray';
import { FieldValues } from '../types';

const filterArray = (target: any) => {
  for (const key in target) {
    if (isArray(target[key])) {
      target[key] = target[key].filter(Boolean);
      filterArray(target[key]);
    }
  }

  return target;
};

export default (data: FieldValues): any =>
  filterArray(
    Object.entries(data).reduce(
      (previous: FieldValues, [key, value]): FieldValues => {
        if (isObjectString(key)) {
          set(previous, key, value);
          return previous;
        }

        return { ...previous, [key]: value };
      },
      {},
    ),
  );
