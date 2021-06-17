import { FieldRefs, FieldValues } from '../types';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import omit from '../utils/omit';
import set from '../utils/set';

const getFieldsValues = (
  fieldsRef: FieldRefs,
  output: FieldValues = {},
): any => {
  for (const name in fieldsRef) {
    const field = fieldsRef[name];

    if (field && !isNullOrUndefined(output)) {
      const _f = field._f;
      const current = omit(field, '_f');

      set(
        output,
        name,
        _f && _f.ref
          ? _f.ref.disabled || (_f.refs && _f.refs.every((ref) => ref.disabled))
            ? undefined
            : _f.value
          : Array.isArray(field)
          ? []
          : {},
      );

      current && getFieldsValues(current, output[name]);
    }
  }

  return output;
};

export default getFieldsValues;
