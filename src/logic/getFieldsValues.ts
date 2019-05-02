import getFieldValue from './getFieldValue';

export default function getFieldsValues(
  fields,
  filedName: string | string[] = undefined,
): { [key: string]: string | number } {
  return Object.values(fields).reduce((previous, data: any) => {
    const {
      ref,
      ref: { name },
    } = data;
    const value = getFieldValue(fields, ref);

    if (typeof filedName === 'string') {
      if (name === filedName) {
        return value;
      }

      return previous;
    }

    const copy = { ...(previous || {}) };
    if (Array.isArray(filedName)) {
      if (filedName.includes(name)) {
        copy[name] = value;
      }
    } else {
      copy[name] = value;
    }

    return copy;
  }, undefined);
}
