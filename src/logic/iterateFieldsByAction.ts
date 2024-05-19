import { FieldRefs, InternalFieldName, Ref } from '../types';
import { get } from '../utils';
import isObject from '../utils/isObject';

/**
 * Iterates over field references and performs
 * an action on each field. This function traverses
 * through the field references, applying the given
 * action to each field.
 * @remarks The traversal can be limited to specific field names,
 * and it can be aborted early based on the action's return value.
 *
 * @example
 * const fields = {
 *   field1: {
 *     _f: {
 *       ref: document.createElement('input'),
 *       name: 'field1',
 *     }},
 *   field2: {
 *     _f: {
 *       refs: [document.createElement('input')],
 *       name: 'field2',
 *     }}};
 *
 * iterateFieldsByAction(fields, (ref, name) => {
 *   console.log(name, ref);
 * });
 * Output:
 *  field1 <input>
 *  field2 <input>
 */
const iterateFieldsByAction = (
  fields: FieldRefs,
  action: (ref: Ref, name: string) => 1 | undefined | void,
  fieldsNames?: Set<InternalFieldName> | InternalFieldName[] | 0,
  abortEarly?: boolean,
) => {
  for (const key of fieldsNames || Object.keys(fields)) {
    const field = get(fields, key);

    if (field) {
      const { _f, ...currentField } = field;

      if (_f) {
        if (_f.refs && _f.refs[0] && action(_f.refs[0], key) && !abortEarly) {
          break;
        } else if (_f.ref && action(_f.ref, _f.name) && !abortEarly) {
          break;
        } else {
          iterateFieldsByAction(currentField, action);
        }
      } else if (isObject(currentField)) {
        iterateFieldsByAction(currentField, action);
      }
    }
  }
};

export default iterateFieldsByAction;
