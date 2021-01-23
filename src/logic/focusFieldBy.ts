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
      const { _f, ...current } = field;

      if (_f && callback(_f.name)) {
        if (_f.ref.focus && isUndefined(_f.ref.focus())) {
          break;
        } else if (_f.refs) {
          _f.refs[0].focus();
          break;
        }
      } else if (isObject(current)) {
        focusFieldBy(current, callback);
      }
    }
  }
};

export default focusFieldBy;
