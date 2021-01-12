import isUndefined from '../utils/isUndefined';
import { FieldRefs } from '../types';

export default (fields: FieldRefs, callback: (name: string) => boolean) => {
  for (const key in fields) {
    if (callback(key)) {
      const field = fields[key];

      if (field) {
        if (field.__field.ref.focus && isUndefined(field.__field.ref.focus())) {
          break;
        } else if (field.__field.refs) {
          field.__field.refs[0].focus();
          break;
        }
      }
    }
  }
};
