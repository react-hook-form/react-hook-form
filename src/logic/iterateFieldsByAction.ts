import type { FieldRefs, InternalFieldName, Ref } from '../types';
import { get } from '../utils';
import isObject from '../utils/isObject';

const iterateFieldsByAction = (
  fields: FieldRefs,
  action: (ref: Ref, name: string) => 1 | undefined | void,
  fieldsNames?: Set<InternalFieldName> | InternalFieldName[] | 0,
) => {
  for (const key of fieldsNames || Object.keys(fields)) {
    if (key === '_f') {
      continue;
    }

    const field = fieldsNames ? get(fields, key) : fields[key];

    if (field) {
      const { _f } = field;

      if (_f) {
        if (_f.refs && _f.refs[0] && action(_f.refs[0], _f.name)) {
          return true;
        } else if (_f.ref && action(_f.ref, _f.name)) {
          return true;
        } else {
          if (iterateFieldsByAction(field, action)) {
            break;
          }
        }
      } else if (isObject(field) || Array.isArray(field)) {
        if (iterateFieldsByAction(field as FieldRefs, action)) {
          break;
        }
      }
    }
  }
  return;
};
export default iterateFieldsByAction;
