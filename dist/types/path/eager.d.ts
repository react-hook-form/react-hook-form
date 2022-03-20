import { FieldValues } from '../fields';
import { Primitive } from '../utils';
import { ArrayKey, IsTuple, TupleKeys } from './common';
/**
 * Helper type for recursively constructing paths through a type.
 * See {@link Path}
 */
declare type PathImpl<K extends string | number, V> = V extends Primitive ? `${K}` : `${K}` | `${K}.${Path<V>}`;
/**
 * Type which eagerly collects all paths through a type
 * @typeParam T - type which should be introspected
 * @example
 * ```
 * Path<{foo: {bar: string}}> = 'foo' | 'foo.bar'
 * ```
 */
export declare type Path<T> = T extends ReadonlyArray<infer V> ? IsTuple<T> extends true ? {
    [K in TupleKeys<T>]-?: PathImpl<K & string, T[K]>;
}[TupleKeys<T>] : PathImpl<ArrayKey, V> : {
    [K in keyof T]-?: PathImpl<K & string, T[K]>;
}[keyof T];
/**
 * See {@link Path}
 */
export declare type FieldPath<TFieldValues extends FieldValues> = Path<TFieldValues>;
/**
 * Helper type for recursively constructing paths through a type.
 * See {@link ArrayPath}
 */
declare type ArrayPathImpl<K extends string | number, V> = V extends Primitive ? never : V extends ReadonlyArray<infer U> ? U extends Primitive ? never : `${K}` | `${K}.${ArrayPath<V>}` : `${K}.${ArrayPath<V>}`;
/**
 * Type which eagerly collects all paths through a type which point to an array
 * type.
 * @typeParam T - type which should be introspected
 * @example
 * ```
 * Path<{foo: {bar: string[], baz: number[]}}> = 'foo.bar' | 'foo.baz'
 * ```
 */
export declare type ArrayPath<T> = T extends ReadonlyArray<infer V> ? IsTuple<T> extends true ? {
    [K in TupleKeys<T>]-?: ArrayPathImpl<K & string, T[K]>;
}[TupleKeys<T>] : ArrayPathImpl<ArrayKey, V> : {
    [K in keyof T]-?: ArrayPathImpl<K & string, T[K]>;
}[keyof T];
/**
 * See {@link ArrayPath}
 */
export declare type FieldArrayPath<TFieldValues extends FieldValues> = ArrayPath<TFieldValues>;
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
export declare type PathValue<T, P extends Path<T> | ArrayPath<T>> = T extends any ? P extends `${infer K}.${infer R}` ? K extends keyof T ? R extends Path<T[K]> ? PathValue<T[K], R> : never : K extends `${ArrayKey}` ? T extends ReadonlyArray<infer V> ? PathValue<V, R & Path<V>> : never : never : P extends keyof T ? T[P] : P extends `${ArrayKey}` ? T extends ReadonlyArray<infer V> ? V : never : never : never;
/**
 * See {@link PathValue}
 */
export declare type FieldPathValue<TFieldValues extends FieldValues, TFieldPath extends FieldPath<TFieldValues>> = PathValue<TFieldValues, TFieldPath>;
/**
 * See {@link PathValue}
 */
export declare type FieldArrayPathValue<TFieldValues extends FieldValues, TFieldArrayPath extends FieldArrayPath<TFieldValues>> = PathValue<TFieldValues, TFieldArrayPath>;
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
export declare type FieldPathValues<TFieldValues extends FieldValues, TPath extends FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[]> = {} & {
    [K in keyof TPath]: FieldPathValue<TFieldValues, TPath[K] & FieldPath<TFieldValues>>;
};
export {};
//# sourceMappingURL=eager.d.ts.map