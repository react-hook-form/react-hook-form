import getFieldValue from './getFieldValue';

export default function getFieldsValues(fields, filedNames?: string | Array<string>) {
  let value;
  const data: Array<Object> = Object.values(fields);

  return Array.isArray(data)
    ? data.reduce((previous, { ref }: any) => {
        value = getFieldValue(fields, ref);

        if (typeof filedNames === 'string') {
          if (ref.name === filedNames) {
            return value;
          }
        } else {
          // @ts-ignore:
          const copy = { ...previous };
          if (Array.isArray(filedNames) && filedNames.includes(ref.name)) {
            copy[ref.name] = value;
          } else if (!filedNames) {
            copy[ref.name] = value;
          }

          return copy;
        }

        return previous;
      }, undefined)
    : undefined;
}
