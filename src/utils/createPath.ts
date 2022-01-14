import { Auto, Branded, IsNever, IsUnknown, PathString } from '../types';
import { FieldPathSetValue, FieldPathValue } from '../types/path/value';

/**
 * Function for creating a {@link TypedFieldPath} from a path string.
 * @param path - path string
 * @example
 * ```
 * type FooBar = { foo: { bar: string }}
 *
 * const path: TypedFieldPath<FooBar, string> = createPath('foo.bar')
 * ```
 */
export default function createPath<
  TFieldValues,
  TPathString extends PathString,
  TValue = unknown,
  TValueSet = never,
>(
  path: Auto.TypedFieldPath<TFieldValues, TPathString, TValue, TValueSet>,
): Branded.TypedFieldPath<
  TFieldValues,
  IsUnknown<TValue> extends true
    ? FieldPathValue<TFieldValues, TPathString>
    : TValue,
  IsNever<TValueSet> extends true
    ? FieldPathSetValue<TFieldValues, TPathString>
    : TValueSet
> {
  return path as never;
}
