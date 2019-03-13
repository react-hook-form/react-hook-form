import getFieldValue from './getFieldValue';

export default function getFieldsValues(fields, filedNames?: string | Array<string>) {
  return Object.values(fields).reduce((previous, { ref }: any) => {
    const value = getFieldValue(fields, ref);

    if (typeof filedNames === 'string') {
      if (ref.name === filedNames){
        return value;
      }
    } else {
      const copy = { ...previous };
      if (Array.isArray(filedNames) && filedNames.includes(ref.name)) {
        copy[ref.name] = value;
      } else {
        copy[ref.name] = value;
      }

      return copy;
    }
  }, undefined);
}
