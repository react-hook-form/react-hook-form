const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const reIsPlainProp = /^\w*$/;
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
const reEscapeChar = /\\(\\)?/g;
const reIsUint = /^(?:0|[1-9]\d*)$/;
const isArray = Array.isArray;

function isIndex(value) {
  return reIsUint.test(value) && value > -1;
}

function isKey(value) {
  if (isArray(value)) return false;
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value);
}

const stringToPath = string => {
  const result: string[] = [];
  string.replace(rePropName, (match, number, quote, string) => {
    result.push(quote ? string.replace(reEscapeChar, '$1') : number || match);
  });
  return result;
};

export default function set(object, path, value) {
  path = isKey(path) ? [path] : stringToPath(path);

  let index = -1;
  const length = path.length;
  const lastIndex = length - 1;

  while (++index < length) {
    let key = path[index];
    let newValue = value;

    if (index != lastIndex) {
      const objValue = object[key];
      const isObject = typeof objValue === 'object';
      newValue = isObject ? objValue : isIndex(path[index + 1]) ? [] : {};
    }
    object[key] = newValue;
    object = object[key];
  }
  return object;
}
