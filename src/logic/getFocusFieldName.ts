import { FieldArrayMethodProps, InternalFieldName } from '../types';
import isUndefined from '../utils/isUndefined';

export default (
  name: InternalFieldName,
  index: number,
  options: FieldArrayMethodProps = {},
): string =>
  options.focus || isUndefined(options.focus)
    ? options.focusName ||
      `${name}.${isUndefined(options.focusIndex) ? index : options.focusIndex}.`
    : '';
