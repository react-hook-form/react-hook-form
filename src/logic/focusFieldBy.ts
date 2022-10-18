import { FieldRefs, InternalFieldName } from '../types';
import { get } from '../utils';
import isObject from '../utils/isObject';

const focusFieldBy = (
  fields: FieldRefs,
  callback: (name?: string) => boolean,
  fieldsNames?: Set<InternalFieldName> | InternalFieldName[],
) => {
  for (const key of fieldsNames || Object.keys(fields)) {
    const field = get(fields, key);

    if (field) {
      const { _f, ...currentField } = field;

      if (_f && callback(_f.name)) {
        if (_f.ref.focus) {
          _f.ref.focus();
          break;
        } else if (_f.refs && _f.refs[0].focus) {
          _f.refs[0].focus();
          break;
        }
      } else if (isObject(currentField)) {
        focusFieldBy(currentField, callback);
      }
    }
  }
};

export default focusFieldBy;
