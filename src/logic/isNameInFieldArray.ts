import { InternalFieldName } from '../types';

import getNodeParentName from './getNodeParentName';

export default (names: Set<InternalFieldName>, name: InternalFieldName) =>
  names.has(name ? getNodeParentName(name) : name);
