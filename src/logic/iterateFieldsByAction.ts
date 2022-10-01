import { FieldRefs, InternalFieldName, Ref } from '../types';
import { get } from '../utils';
import isObject from '../utils/isObject';

const iterateFieldsByAction = (
  fields: FieldRefs,
  action: (ref: Ref, name: string) => 1 | undefined,
  fieldsNames?: Set<InternalFieldName> | InternalFieldName[],
) => {
  for (const key of fieldsNames || Object.keys(fields)) {
    const field = get(fields, key);

    if (field) {
      const { _f, ...currentField } = field;

      if (_f) {
        if (_f.refs && _f.refs[0] && action(_f.refs[0], key)) {
          break;
        } else if (_f.ref && action(_f.ref, _f.name)) {
          break;
        }
      } else if (isObject(currentField)) {
        iterateFieldsByAction(currentField, action);
      }
    }
  }
};

export default iterateFieldsByAction;
