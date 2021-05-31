import {
  CriteriaMode,
  Field,
  FieldName,
  FieldRefs,
  InternalFieldName,
} from '../types';
import { get } from '../utils';
import isKey from '../utils/isKey';
import set from '../utils/set';

export default <TFieldValues>(
  fieldsNames: Set<InternalFieldName> | InternalFieldName[],
  fieldsRefs: FieldRefs,
  criteriaMode?: CriteriaMode,
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
    criteriaMode,
    names: [...fieldsNames] as FieldName<TFieldValues>[],
    fields: currentFields,
  };
};
