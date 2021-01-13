import isUndefined from '../utils/isUndefined';
import { FieldRefs } from '../types';
import isObject from '../utils/isObject';
import { get } from '../utils';

const focusFieldBy = (
  fields: FieldRefs,
  callback: (name: string) => boolean,
  fieldsNames?: Record<string, any>,
) => {
  for (const key in fieldsNames || fields) {
    const field = get(fields, key);

    if (field) {
      const { __field, ...current } = field;

      if (__field && callback(__field.name)) {
        if (__field.ref.focus && isUndefined(__field.ref.focus())) {
          break;
        } else if (__field.refs) {
          __field.refs[0].focus();
          break;
        }
      } else if (isObject(current)) {
        focusFieldBy(current, callback);
      }
    }
  }
};

export default focusFieldBy;
