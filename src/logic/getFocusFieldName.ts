import { FieldArrayMethodProps, InternalFieldName } from '../types';
import isUndefined from '../utils/isUndefined';
/**
 * Constructs the focus name for a field array 
 * based on the given parameters. If the `shouldFocus`
 * option is true or undefined, it returns a focus name.
 * The focus name is constructed based on the 
 * `focusName` option, the `name` parameter, 
 * and either the `focusIndex` option or the provided `index`.
 * If `shouldFocus` is false, it returns an empty string.
 *
 * @example
 * getFocusName('field', 2, { shouldFocus: true });
 * Output: "field.2."
 *
 * getFocusName('field', 2, { shouldFocus: true, focusName: 'apple' });
 * Output: "apple"
 *
 * getFocusName('field', 2, { shouldFocus: false });
 // Output: ""
 */
export default (
  name: InternalFieldName,
  index: number,
  options: FieldArrayMethodProps = {},
): string =>
  options.shouldFocus || isUndefined(options.shouldFocus)
    ? options.focusName ||
      `${name}.${isUndefined(options.focusIndex) ? index : options.focusIndex}.`
    : '';
