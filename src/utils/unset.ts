import isArray from './isArray';
import isUndefined from './isUndefined';
import isKey from './isKey';
import stringToPath from './stringToPath';
import isObject from './isObject';
import isEmptyObject from './isEmptyObject';
import isNullOrUndefined from './isNullOrUndefined';

function castPath(value: string) {
  return isArray(value) ? value : stringToPath(value);
}

function baseGet(object: any, path: any) {
  const updatePath = isKey(path) ? [path] : castPath(path);

  const length = path.length;
  let index = 0;

  while (index < length) {
    object = isUndefined(object) ? index++ : object[updatePath[index++]];
  }
  return index == length ? object : undefined;
}

function baseSlice(array: string | string[], start: number, end: number) {
  let index = -1;
  let length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : end - start;

  const result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

function parent(object: any, path: string | string[]) {
  return path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
}

function baseUnset(object: any, path: string) {
  const updatePath = isKey(path) ? [path] : castPath(path);
  const childObject = parent(object, updatePath);
  const key = updatePath[updatePath.length - 1];
  const result = !(childObject != null) || delete childObject[key];
  let tempObject = object;

  for (const item of updatePath.slice(0, -1)) {
    if (isUndefined(tempObject)) {
      continue;
    }

    if (
      isUndefined(tempObject[item]) ||
      (isObject(tempObject[item]) && isEmptyObject(tempObject[item]))
    ) {
      delete tempObject[item];
    } else if (isArray(tempObject[item])) {
      const arrayContainDataLength = tempObject[item].filter(
        (data: any) =>
          !(isObject(data) && isEmptyObject(data)) && !isNullOrUndefined(data),
      ).length;
      if (!arrayContainDataLength) {
        delete tempObject[item];
      }
    }

    tempObject = tempObject[item];
  }

  return result;
}

export default function unset(object: any, paths: string[]) {
  paths.forEach(path => {
    baseUnset(object, path);
  });
  return object;
}
