import { FieldValues } from '../fields';
import { BrowserNativeObject, IsAny, IsEqual, Primitive } from '../utils';

import { ArrayKey, IsTuple, TupleKeys } from './common';

/**
 * The maximum recursion depth for type checking.
 * Adjust this value to control how deeply nested paths are evaluated.
 * @example
 * ```
 * type MaxDepth = 5; // Recursion will go up to 5 levels deep
 * ```
 */
type MaxDepth = 6; // Define a maximum recursion depth

/**
 * Utility type to decrement the depth value.
 * This is used to limit the recursion in type checking.
 * @example
 * ```
 * type Depth4 = DecrementDepth<5>; // Depth4 is 4
 * type Depth3 = DecrementDepth<4>; // Depth3 is 3
 * ```
 */
type DecrementDepth<D extends number> = D extends 6
  ? 5
  : D extends 5
    ? 4
    : D extends 4
      ? 3
      : D extends 3
        ? 2
        : D extends 2
          ? 1
          : D extends 1
            ? 0
            : never;

/**
 * Helper function to break apart T1 and check if any are equal to T2
 *
 * See {@link IsEqual}
 */
type AnyIsEqual<T1, T2> = T1 extends T2
  ? IsEqual<T1, T2> extends true
    ? true
    : never
  : never;

/**
 * Helper type for recursively constructing paths through a type.
 * This actually constructs the strings and recurses into nested
 * object types.
 *
 * See {@link Path}
 */
type PathImpl<
  K extends string | number,
  V,
  TraversedTypes,
  Depth extends number,
> = Depth extends 0
  ? never
  : V extends Primitive | BrowserNativeObject
    ? `${K}`
    : // Check so that we don't recurse into the same type
      // by ensuring that the types are mutually assignable
      // mutually required to avoid false positives of subtypes
      true extends AnyIsEqual<TraversedTypes, V>
      ? `${K}`
      :
          | `${K}`
          | `${K}.${PathInternal<V, TraversedTypes | V, DecrementDepth<Depth>>}`;

/**
 * Helper type for recursively constructing paths through a type.
 * This obscures the internal type param TraversedTypes from exported contract.
 *
 * See {@link Path}
 */
type PathInternal<T, TraversedTypes, Depth extends number> =
  T extends ReadonlyArray<infer V>
    ? IsTuple<T> extends true
      ? {
          [K in TupleKeys<T>]-?: PathImpl<
            K & string,
            T[K],
            TraversedTypes,
            Depth
          >;
        }[TupleKeys<T>]
      : PathImpl<ArrayKey, V, TraversedTypes, Depth>
    : {
        [K in keyof T]-?: PathImpl<K & string, T[K], TraversedTypes, Depth>;
      }[keyof T];

/**
 * Type which eagerly collects all paths through a type
 * @typeParam T - type which should be introspected
 * @example
 * ```
 * Path<{foo: {bar: string}}> = 'foo' | 'foo.bar'
 * ```
 */
// We want to explode the union type and process each individually
// so assignable types don't leak onto the stack from the base.
export type Path<T> = T extends any ? PathInternal<T, T, MaxDepth> : never;

/**
 * See {@link Path}
 */
export type FieldPath<TFieldValues extends FieldValues> = Path<TFieldValues>;

/**
 * Helper type for recursively constructing paths through a type.
 * This actually constructs the strings and recurses into nested
 * object types.
 *
 * See {@link ArrayPath}
 */
type ArrayPathImpl<
  K extends string | number,
  V,
  TraversedTypes,
  Depth extends number,
> = Depth extends 0
  ? never
  : V extends Primitive | BrowserNativeObject
    ? IsAny<V> extends true
      ? string
      : never
    : V extends ReadonlyArray<infer U>
      ? U extends Primitive | BrowserNativeObject
        ? IsAny<V> extends true
          ? string
          : never
        : // Check so that we don't recurse into the same type
          // by ensuring that the types are mutually assignable
          // mutually required to avoid false positives of subtypes
          true extends AnyIsEqual<TraversedTypes, V>
          ? never
          :
              | `${K}`
              | `${K}.${ArrayPathInternal<V, TraversedTypes | V, DecrementDepth<Depth>>}`
      : true extends AnyIsEqual<TraversedTypes, V>
        ? never
        : `${K}.${ArrayPathInternal<V, TraversedTypes | V, DecrementDepth<Depth>>}`;

/**
 * Helper type for recursively constructing paths through a type.
 * This obscures the internal type param TraversedTypes from exported contract.
 *
 * See {@link ArrayPath}
 */
type ArrayPathInternal<T, TraversedTypes, Depth extends number> =
  T extends ReadonlyArray<infer V>
    ? IsTuple<T> extends true
      ? {
          [K in TupleKeys<T>]-?: ArrayPathImpl<
            K & string,
            T[K],
            TraversedTypes,
            Depth
          >;
        }[TupleKeys<T>]
      : ArrayPathImpl<ArrayKey, V, TraversedTypes, Depth>
    : {
        [K in keyof T]-?: ArrayPathImpl<
          K & string,
          T[K],
          TraversedTypes,
          Depth
        >;
      }[keyof T];

/**
 * Type which eagerly collects all paths through a type which point to an array
 * type.
 * @typeParam T - type which should be introspected.
 * @example
 * ```
 * Path<{foo: {bar: string[], baz: number[]}}> = 'foo.bar' | 'foo.baz'
 * ```
 */
// We want to explode the union type and process each individually
// so assignable types don't leak onto the stack from the base.
export type ArrayPath<T> = T extends any
  ? ArrayPathInternal<T, T, MaxDepth>
  : never;
/**
 * See {@link ArrayPath}
 */
export type FieldArrayPath<TFieldValues extends FieldValues> =
  ArrayPath<TFieldValues>;

/**
 * Type to evaluate the type which the given path points to.
 * @typeParam T - deeply nested type which is indexed by the path
 * @typeParam P - path into the deeply nested type
 * @example
 * ```
 * PathValue<{foo: {bar: string}}, 'foo.bar'> = string
 * PathValue<[number, string], '1'> = string
 * ```
 */
export type PathValue<T, P extends Path<T> | ArrayPath<T>> = T extends any
  ? P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? R extends Path<T[K]>
        ? PathValue<T[K], R>
        : never
      : K extends `${ArrayKey}`
        ? T extends ReadonlyArray<infer V>
          ? PathValue<V, R & Path<V>>
          : never
        : never
    : P extends keyof T
      ? T[P]
      : P extends `${ArrayKey}`
        ? T extends ReadonlyArray<infer V>
          ? V
          : never
        : never
  : never;

/**
 * See {@link PathValue}
 */
export type FieldPathValue<
  TFieldValues extends FieldValues,
  TFieldPath extends FieldPath<TFieldValues>,
> = PathValue<TFieldValues, TFieldPath>;

/**
 * See {@link PathValue}
 */
export type FieldArrayPathValue<
  TFieldValues extends FieldValues,
  TFieldArrayPath extends FieldArrayPath<TFieldValues>,
> = PathValue<TFieldValues, TFieldArrayPath>;

/**
 * Type to evaluate the type which the given paths point to.
 * @typeParam TFieldValues - field values which are indexed by the paths
 * @typeParam TPath        - paths into the deeply nested field values
 * @example
 * ```
 * FieldPathValues<{foo: {bar: string}}, ['foo', 'foo.bar']>
 *   = [{bar: string}, string]
 * ```
 */
export type FieldPathValues<
  TFieldValues extends FieldValues,
  TPath extends FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[],
> = {} & {
  [K in keyof TPath]: FieldPathValue<
    TFieldValues,
    TPath[K] & FieldPath<TFieldValues>
  >;
};

/**
 * Type which eagerly collects all paths through a fieldType that matches a give type
 * @typeParam TFieldValues - field values which are indexed by the paths
 * @typeParam TValue       - the value you want to match into each type
 * @example
 * ```typescript
 * FieldPathByValue<{foo: {bar: number}, baz: number, bar: string}, number>
 *   = 'foo.bar' | 'baz'
 * ```
 */
export type FieldPathByValue<TFieldValues extends FieldValues, TValue> = {
  [Key in FieldPath<TFieldValues>]: FieldPathValue<
    TFieldValues,
    Key
  > extends TValue
    ? Key
    : never;
}[FieldPath<TFieldValues>];
