import isObject from './isObject';
import isPlainObject from './isPlainObject';
import isWeb from './isWeb';

const constructFromSymbol = Symbol.for('constructDateFrom');

export default function cloneObject<T>(data: T): T {
  if (data instanceof Date) {
    if (isConstructableDate(data)) {
      return data[constructFromSymbol](data.getTime()) as T;
    }

    return new Date(data) as T;
  }

  const isFileListInstance =
    typeof FileList !== 'undefined' && data instanceof FileList;

  if (isWeb && (data instanceof Blob || isFileListInstance)) {
    return data;
  }

  const isArray = Array.isArray(data);

  if (!isArray && !(isObject(data) && isPlainObject(data))) {
    return data;
  }

  const copy = isArray ? [] : Object.create(Object.getPrototypeOf(data));

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      copy[key] = cloneObject(data[key]);
    }
  }

  return copy;
}

interface ConstructableDate extends Date {
  [constructFromSymbol]: <DateType extends Date = Date>(
    value: number,
  ) => DateType;
}

function isConstructableDate(data: Date): data is ConstructableDate {
  return constructFromSymbol in data;
}
