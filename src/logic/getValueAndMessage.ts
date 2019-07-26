import isNullOrUndefined from '../utils/isNullOrUndefined';
import { DataType } from '../types';

export default (
  item: DataType | number | string | undefined,
): {
  value: number | string | RegExp;
  message: string;
} => ({
  value:
    typeof item === 'object' && !isNullOrUndefined(item.value)
      ? item.value
      : item,
  message: typeof item === 'object' && item.message ? item.message : '',
});
