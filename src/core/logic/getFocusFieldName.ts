import isUndefined from '../utils/isUndefined';
import { FieldArrayMethodProps, InternalFieldName } from '..';

export default (
  name: InternalFieldName,
  index: number,
  options: FieldArrayMethodProps = {},
): string =>
  options.shouldFocus || isUndefined(options.shouldFocus)
    ? options.focusName ||
      `${name}.${isUndefined(options.focusIndex) ? index : options.focusIndex}.`
    : '';
