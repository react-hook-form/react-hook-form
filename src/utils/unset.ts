import isArray from './isArray';
import isUndefined from './isUndefined';
import isKey from './isKey';
import stringToPath from './stringToPath';
import isEmptyObject from './isEmptyObject';
import isObject from './isObject';
// import isNullOrUndefined from './isNullOrUndefined';

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

  let previousObjRef = undefined;
  const paths = updatePath.slice(0, -1);
  const pathsLength = paths.length;

  for (let k = 0; k < pathsLength; k++) {
    let index = 0;
    let objRef = undefined;
    const currentPaths = updatePath.slice(0, -(k + 1));
    const currentPathsLength = currentPaths.length - 1;

    if (k > 0) {
      previousObjRef = object;
    }

    for (const item of currentPaths) {
      objRef = objRef ? objRef[item] : object[item];

      if (currentPathsLength === index) {
        if (isObject(objRef) && isEmptyObject(objRef)) {
          if (previousObjRef) {
            delete previousObjRef[item];
          } else {
            delete object[item];
          }
        } else if (
          isArray(objRef) &&
          !objRef.filter(data => isObject(data) && !isEmptyObject(data)).length
        ) {
          delete previousObjRef[item];
        }
      }

      previousObjRef = objRef;
      index++;
    }
  }

  return result;
}

export default function unset(object: any, paths: string[]) {
  paths.forEach(path => {
    baseUnset(object, path);
  });
  return object;
}
