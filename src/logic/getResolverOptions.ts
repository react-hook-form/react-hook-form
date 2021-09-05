import {
  CriteriaMode,
  Field,
  FieldName,
  FieldRefs,
  InternalFieldName,
} from '../types';
import { get } from '../utils';
import set from '../utils/set';

export default <TFieldValues>(
  fieldsNames: Set<InternalFieldName> | InternalFieldName[],
  _fieldss: FieldRefs,
  criteriaMode?: CriteriaMode,
  shouldUseNativeValidation?: boolean | undefined,
) => {
  const fields: Record<InternalFieldName, Field['_f']> = {};

  for (const name of fieldsNames) {
    const field = get(_fieldss, name) as Field;

    field && set(fields, name, field._f);
  }

  return {
    criteriaMode,
    names: [...fieldsNames] as FieldName<TFieldValues>[],
    fields,
    shouldUseNativeValidation,
  };
};
