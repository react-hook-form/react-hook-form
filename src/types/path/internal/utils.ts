/**
 * Type which can be traversed through with a {@link PathString}.
 * I.e. objects, arrays, and tuples
 */
export type Traversable = object;

/**
 * Type which can be used to index an array or tuple type.
 */
export type ArrayKey = number;

/**
 * Type which can be used to index an object.
 */
export type Key = string;

/**
 * Type to assert that a type is a {@link Key}.
 * @typeParam T - type which may be a {@link Key}
 */
export type AsKey<T> = Extract<T, Key>;

/**
 * Type to convert a type to a {@link Key}.
 * @typeParam T - type which may be converted to a {@link Key}
 */
export type ToKey<T> = T extends ArrayKey ? `${T}` : AsKey<T>;

/**
 * Type to query whether an array type T is a tuple type.
 * @typeParam T - type which may be an array or tuple
 * @example
 * ```
 * IsTuple<[number]> = true
 * IsTuple<number[]> = false
 * ```
 */
export type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
  ? false
  : true;

/**
 * Type to intersect a union type.
 * See https://fettblog.eu/typescript-union-to-intersection/
 * @typeParam U - union
 * @example
 * ```
 * UnionToIntersection<{ foo: string } | { bar: number }>
 *   = { foo: string; bar: number }
 * ```
 */
export type UnionToIntersection<U> = (
  U extends any ? (_: U) => any : never
) extends (_: infer I) => any
  ? I
  : never;

/**
 * Type which represents a property access.
 * @typeParam Get - the type when getting the property (covariant)
 * @typeParam Set - the type required for setting the property (contravariant)
 * @remarks
 * See {@link https://dmitripavlutin.com/typescript-covariance-contravariance/}
 * for an explanation of covariance and contravariance.
 *
 * Using it as a constraint:
 *  - `'abcd'` is a subtype   of `string`
 *  - `string` is a supertype of `'abcd'`
 *
 * Therefore,
 *  - `AccessPattern<'abcd', 'abcd'>` extends        `AccessPattern<string, 'abcd'>`
 *  - `AccessPattern<'abcd', string>` extends        `AccessPattern<'abcd', 'abcd'>`
 *  - `AccessPattern<string, 'abcd'>` doesn't extend `AccessPattern<'abcd', 'abcd'>`
 *  - `AccessPattern<'abcd', 'abcd'>` doesn't extend `AccessPattern<'abcd', string>`
 */
export type AccessPattern<Get = unknown, Set = never> = (_: Set) => Get;
