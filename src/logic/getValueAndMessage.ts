import isNullOrUndefined from '../utils/isNullOrUndefined';
import { DataType } from '../types';
import isObject from '../utils/isObject';

export default (
  item?: DataType | number | string,
): {
  value: number | string | RegExp;
  message: string;
} => ({
  value: isObject(item) && !isNullOrUndefined(item.value) ? item.value : item,
  message: isObject(item) && item.message ? item.message : '',
});
