import isUndefined from '../utils/isUndefined';

export default (name: any, fields?: any): void => {
  if (
    process.env.NODE_ENV !== 'production' &&
    ((fields && isUndefined(fields[name])) || !fields)
  ) {
    throw new Error(`${name} field not found.`);
  }
};
