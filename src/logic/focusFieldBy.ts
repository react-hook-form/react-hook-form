import isUndefined from '../utils/isUndefined';
import isObject from '../utils/isObject';
import { get } from '../utils';
import { FieldRefs, InternalFieldName } from '../types';

const focusFieldBy = (
  fields: FieldRefs,
  callback: (name: string) => boolean,
  fieldsNames?: Partial<Record<InternalFieldName, string>>,
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
