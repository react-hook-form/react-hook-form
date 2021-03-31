import getNodeParentName from './getNodeParentName';
import { InternalFieldName } from '../types';

export default (names: Set<InternalFieldName>, name: InternalFieldName) =>
  [...names].some((current) => getNodeParentName(name) === current);
