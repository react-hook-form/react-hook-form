import type { InternalFieldName } from '../types';

import { FIELD_ARRAY_INDEX_PATTERN } from './getNodeParentName';

export default (names: Set<InternalFieldName>, name: InternalFieldName) => {
  // Check all possible parent paths up to each `.\d+` segment, not just the
  // first. For `steps.0.items.2.name`, this checks both `steps` and
  // `steps.0.items` against the field array name set.
  const pattern = new RegExp(FIELD_ARRAY_INDEX_PATTERN.source, 'g');
  let match;
  while ((match = pattern.exec(name)) !== null) {
    const parentName = name.substring(0, match.index);
    if (names.has(parentName)) {
      return true;
    }
  }
  return false;
};
