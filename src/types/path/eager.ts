import { FieldValues } from '../fields';
import { IsAny, IsNever, Primitive } from '../utils';

import {
  ArrayKey,
  EvaluateKey,
  IsTuple,
  JoinPathTuple,
  Key,
  Keys,
  PathTuple,
  TupleKeys,
} from './common';

/** WIP */
interface PathMeta {
  Path: PathTuple;
  Type: unknown;
}

/** WIP */
interface PathState {
  Next: PathMeta;
  Result: PathTuple;
}

/** WIP */
type CreatePathMeta<
  PT extends PathTuple,
  T,
  K extends Key,
> = IsAny<T> extends true
  ? never
  : IsNever<T> extends true
  ? never
  : IsNever<K> extends true
  ? never
  : K extends any
  ? {
      Path: [...PT, K];
      Type: EvaluateKey<T, K>;
    }
  : never;

/** WIP */
type GetNext<PM extends PathMeta> = PM extends any
  ? CreatePathMeta<PM['Path'], PM['Type'], Keys<PM['Type']>>
  : never;

/** WIP */
type GetResult<PM extends PathMeta> = PM extends any
  ? IsAny<PM['Type']> extends true
    ? JoinPathTuple<PM['Path']> | JoinPathTuple<[...PM['Path'], Key]>
    : IsNever<PM['Type']> extends true
    ? JoinPathTuple<PM['Path']> | JoinPathTuple<[...PM['Path'], Key]>
    : JoinPathTuple<PM['Path']>
  : never;

/** WIP */
type PathImpl<S extends PathState> = IsNever<S['Next']> extends true
  ? S['Result']
  : PathImpl<{
      Next: GetNext<S['Next']>;
      Result: S['Result'] | GetResult<S['Next']>;
    }>;

/** WIP */
export type Path<T> = PathImpl<{ Next: { Path: []; Type: T }; Result: never }>;

/**
 * See {@link Path}
 */
export type FieldPath<TFieldValues extends FieldValues> = Path<TFieldValues>;

/**
 * Helper type for recursively constructing paths through a type.
 * See {@link ArrayPath}
 */
type ArrayPathImpl<K extends string | number, V> = V extends Primitive
  ? never
  : V extends ReadonlyArray<infer U>
  ? U extends Primitive
    ? never
    : `${K}` | `${K}.${ArrayPath<V>}`
  : `${K}.${ArrayPath<V>}`;

/**
 * Type which eagerly collects all paths through a type which point to an array
 * type.
 * @typeParam T - type which should be introspected
 * @example
 * ```
 * Path<{foo: {bar: string[], baz: number[]}}> = 'foo.bar' | 'foo.baz'
 * ```
 */
export type ArrayPath<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: ArrayPathImpl<K & string, T[K]>;
      }[TupleKeys<T>]
    : ArrayPathImpl<ArrayKey, V>
  : {
      [K in keyof T]-?: ArrayPathImpl<K & string, T[K]>;
    }[keyof T];

/**
 * See {@link ArrayPath}
 */
export type FieldArrayPath<TFieldValues extends FieldValues> =
  ArrayPath<TFieldValues>;

/**
 * Type to evaluate the type which the given Path points to.
 * @typeParam T - deeply nested type which is indexed by the Path
 * @typeParam P - Path into the deeply nested type
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
