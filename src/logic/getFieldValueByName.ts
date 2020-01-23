import transformToNestObject from './transformToNestObject';
import getFieldsValues from './getFieldsValues';

export default <T, K extends keyof T>(fields: T, name?: K) => {
  const results = transformToNestObject(getFieldsValues(fields));
  return name ? results[name] : results;
};
