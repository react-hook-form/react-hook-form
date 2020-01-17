import getFieldValues from './getFieldValues';
import transformToNestObject from './transformToNestObject';

export default <T, K extends keyof T>(
  fields: T,
  name: K,
  shouldCheckDirty: boolean,
) => shouldCheckDirty && transformToNestObject(getFieldValues(fields))[name];
