import type { InternalFieldName } from '../types';

export default (names: Set<InternalFieldName>, name: InternalFieldName) => {
  for (const fieldArrayName of names) {
    if (name.startsWith(fieldArrayName + '.')) {
      return true;
    }
  }
  return false;
};
