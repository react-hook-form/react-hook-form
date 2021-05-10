import isBoolean from './isBoolean';
import isEmptyObject from './isEmptyObject';
import isKey from './isKey';
import isObject from './isObject';
import isUndefined from './isUndefined';
import stringToPath from './stringToPath';

function baseGet(object: any, updatePath: string[]) {
  const length = updatePath.slice(0, -1).length;
  let index = 0;

  while (index < length) {
    object = isUndefined(object)
      ? index++
      : object[updatePath[index++].replace(/^\[/, '')];
  }

  return object;
}

export default function unset(object: any, path: string) {
  const updatePath = isKey(path) ? [path] : stringToPath(path);
  const childObject =
    updatePath.length == 1 ? object : baseGet(object, updatePath);
  const key = updatePath[updatePath.length - 1].replace(/^\[/, '');
  let previousObjRef;

  if (childObject) {
    delete childObject[key];
  }

  for (let k = 0; k < updatePath.slice(0, -1).length; k++) {
    let index = -1;
    let objectRef;
    const currentPaths = updatePath.slice(0, -(k + 1));
    const currentPathsLength = currentPaths.length - 1;

    if (k > 0) {
      previousObjRef = object;
    }

    while (++index < currentPaths.length) {
      const item = currentPaths[index].replace(/^\[/, '');
      objectRef = objectRef ? objectRef[item] : object[item];

      if (
        currentPathsLength === index &&
        ((isObject(objectRef) && isEmptyObject(objectRef)) ||
          (Array.isArray(objectRef) &&
            !objectRef.filter(
              (data) =>
                (isObject(data) && !isEmptyObject(data)) || isBoolean(data),
            ).length))
      ) {
        previousObjRef ? delete previousObjRef[item] : delete object[item];
      }

      previousObjRef = objectRef;
    }
  }

  return object;
}
