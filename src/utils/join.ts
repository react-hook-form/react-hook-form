import {
  Auto,
  Branded,
  PathString,
  TryInferFieldPathSetValue,
  TryInferFieldPathValue,
} from '../types';

/**
 * Function for joining two paths / path strings to a {@link TypedFieldPath}.
 * @param path      - base path
 * @param childPath - the path which should be appended to the base path
 * @example
 * ```
 * type Baz = { baz: string }
 * type FooBarBaz = { foo: { bar: Baz }}
 *
 * const path: TypedFieldPath<FooBarBaz, Baz> = of('foo.bar')
 * const joinedPath: TypedFieldPath<FooBar, string> = join(path, 'baz')
 * ```
 */
export default function join<
  TFieldValues,
  TPathString extends PathString,
  TChildFieldValues,
  TChildPathString extends PathString,
  TValue = unknown,
  TValueSet = never,
>(
  path: Auto.TypedFieldPath<
    TFieldValues,
    TPathString,
    TChildFieldValues,
    NonNullable<TChildFieldValues>
  >,
  childPath: Auto.TypedFieldPath<
    TChildFieldValues,
    TChildPathString,
    TValue,
    TValueSet
  >,
): Branded.TypedFieldPath<
  TFieldValues,
  TryInferFieldPathValue<TChildFieldValues, TChildPathString, TValue>,
  TryInferFieldPathSetValue<TChildFieldValues, TChildPathString, TValueSet>
> {
  return `${path}.${childPath}` as never;
}
