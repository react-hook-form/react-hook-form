import isKey from './isKey';
import stringToPath from './stringToPath';
import isEmptyObject from './isEmptyObject';
import isObject from './isObject';
import isUndefined from './isUndefined';
import isBoolean from './isBoolean';

function baseGet(object: any, updatePath: (string | number)[]) {
  const length = updatePath.slice(0, -1).length;
  let index = 0;

  while (index < length) {
    object = isUndefined(object) ? index++ : object[updatePath[index++]];
  }

  return object;
}

export default function unset(object: any, path: string) {
  const updatePath = isKey(path) ? [path] : stringToPath(path);
  const childObject =
    updatePath.length == 1 ? object : baseGet(object, updatePath);
  const key = updatePath[updatePath.length - 1];
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
      const item = currentPaths[index];
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
