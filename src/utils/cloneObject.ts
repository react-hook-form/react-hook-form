import isWeb from './isWeb';

export default function cloneObject<T>(data: T): T {
  // Primitives (and null) can't be Date/Blob/plain-object instances, so
  // bail out before any of those checks — this also avoids boxing `data`
  // to look up `.constructor` below, which matters here since most leaf
  // values in a form are primitives.
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (data instanceof Date) {
    return new Date(data) as any;
  }

  const isFileListInstance =
    typeof FileList !== 'undefined' && data instanceof FileList;

  if (isWeb && (data instanceof Blob || isFileListInstance)) {
    return data;
  }

  const isArray = Array.isArray(data);

  // Equivalent to the old `isObject(data) && isPlainObject(data)` check:
  // `isPlainObject` ultimately tested whether `data`'s prototype chain
  // resolves to `Object` as its constructor, which `data.constructor`
  // already gives us directly (JS walks the prototype chain for us).
  if (!isArray && (data as object).constructor !== Object) {
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
