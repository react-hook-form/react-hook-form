import isPrimitive from './isPrimitive';
import isObject from './isObject';

export const getPath = <T extends string, U extends object | unknown[]>(
  path: T,
  values: U,
): string[] => {
  const getInnerPath = <K>(key: K, value: U, isObject?: boolean) => {
    const pathWithIndex = isObject ? `${path}.${key}` : `${path}[${key}]`;
    return isPrimitive(value) ? pathWithIndex : getPath(pathWithIndex, value);
  };

  return Object.entries(values)
    .map(([key, value]) => getInnerPath(key, value, isObject(values)))
    .flat(Infinity) as string[];
};
