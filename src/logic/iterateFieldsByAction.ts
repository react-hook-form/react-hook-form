import { FieldRefs, InternalFieldName, Ref } from '../types';
import { get } from '../utils';

export default (
  fields: FieldRefs,
  action: (ref: Ref, key: string) => 1 | 0,
  fieldsNames: Set<InternalFieldName> | InternalFieldName[],
) => {
  for (const key of fieldsNames) {
    const field = get(fields, key);

    if (field) {
      const _f = field._f;

      if (_f) {
        if (_f.ref && action(_f.ref, key)) {
          break;
        } else if (_f.refs && _f.refs[0] && action(_f.refs[0], key)) {
          break;
        }
      }
    }
  }
};
