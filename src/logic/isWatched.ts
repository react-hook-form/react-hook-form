import { InternalFieldName, Names } from '../types';

export default (
  name: InternalFieldName,
  _names: Names,
  isBlurEvent?: boolean,
) =>
  !isBlurEvent &&
  (_names.watchAll ||
    _names.watch.has(name) ||
    _names.watch.has((name.match(/\w+/) || [])[0]));
