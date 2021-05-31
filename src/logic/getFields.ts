import { Field, FieldRefs, InternalFieldName } from '../types';
import { get } from '../utils';
import isKey from '../utils/isKey';
import set from '../utils/set';

export default (
  fieldsNames: Set<InternalFieldName> | InternalFieldName[],
  fieldsRefs: FieldRefs,
) => {
  const currentFields: Record<InternalFieldName, Field['_f']> = {};

  for (const name of fieldsNames) {
    const field = get(fieldsRefs, name) as Field;

    if (field) {
      !isKey(name)
        ? set(currentFields, name, field._f)
        : (currentFields[name] = field._f);
    }
  }

  return {
    names: [...fieldsNames],
    fields: currentFields,
  };
};
