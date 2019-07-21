import flatten from './flatten';

function getPath(parentPath: string, value: any): any {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      if (Array.isArray(item)) {
        return getPath(`${parentPath}[${index}]`, item);
      } else if (typeof item === 'object') {
        return Object.entries(item).map(([key, value]) => {
          if (typeof value !== 'string') {
            return getPath(`${parentPath}[${index}].${key}`, value);
          }
          return `${parentPath}[${index}].${key}`;
        });
      }

      return `${parentPath}[${index}]`;
    });
  } else if (typeof value === 'object') {
    return Object.entries(value).map(([key, value]) => {
      if (typeof value !== 'string') {
        return getPath(parentPath, value);
      }
      return `${parentPath}.${key}`;
    });
  }
}

export default (parentPath: string, value: any) => {
  return flatten(getPath(parentPath, value));
};
