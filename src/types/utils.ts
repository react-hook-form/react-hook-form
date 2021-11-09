import { FieldValues } from './fields';
import { NestedValue } from './form';

/*
Projects that React Hook Form installed don't include the DOM library need these interfaces to compile.
React Native applications is no DOM available. The JavaScript runtime is ES6/ES2015 only.
These definitions allow such projects to compile with only --lib ES6.

Warning: all of these interfaces are empty.
If you want type definitions for various properties, you need to add `--lib DOM` (via command line or tsconfig.json).
*/

export type Noop = () => void;

interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
}

interface FileList {
  readonly length: number;
  item(index: number): File | null;
  [index: number]: File;
}

export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

export type EmptyObject = { [K in string | number]: never };

export type NonUndefined<T> = T extends undefined ? never : T;

export type LiteralUnion<T extends U, U extends Primitive> =
  | T
  | (U & { _?: never });

/** Recursive Partial Type */
export type DeepPartial<T> = T extends Date | FileList | File | NestedValue
  ? T
  : { [K in keyof T]?: DeepPartial<T[K]> };

/** Deep Partial save for Array parts (and Date/FileList/File/NestedValue types (why NestedValue's here)) */
export type DeepPartialSkipArrayKey<T> = T extends
  | Date
  | FileList
  | File
  | NestedValue
  ? T
  : T extends Array<any>
  ? { [K in keyof T]: DeepPartialSkipArrayKey<T[K]> }
  : { [K in keyof T]?: DeepPartialSkipArrayKey<T[K]> };

export type IsAny<T> = boolean extends (T extends never ? true : false)
  ? true
  : false;

export type DeepMap<T, TValue> = IsAny<T> extends true
  ? any
  : T extends Date | FileList | File | NestedValue
  ? TValue
  : T extends object
  ? { [K in keyof T]: DeepMap<NonUndefined<T[K]>, TValue> }
  : TValue;

/** Is object greater than 1 level deep (not counting NestedValues)? */
export type IsFlatObject<T extends object> = Extract<
  Exclude<T[keyof T], NestedValue | Date | FileList>,
  Array<unknown> | object
> extends never
  ? true
  : false;

/** Is a Tuple (vs an array) - Tuples have hard number lengths, whereas Arrays are open-ended*/
type IsTuple<T extends Array<unknown>> = number extends T['length']
  ? false
  : true;

/** String-based strict key values of the Tuple  */
type TupleKey<T extends Array<unknown>> = Exclude<keyof T, keyof unknown[]>;

/** Numeric (open-ended) key values of an array (any number) */
type ArrayKey = number;

/** Similar grammar to TS's Record<K, V>, returns string literal to represent object field or dot-notation path to sub-fields */
type PathImpl<K extends string | number, V> = V extends Primitive
  ? `${K}`
  : `${K}` | `${K}.${Path<V>}`;

/** All dot-notation paths for a given type, including Array indexing */
export type Path<T> = T extends Array<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKey<T>]-?: PathImpl<K & string, T[K]>;
      }[TupleKey<T>]
    : PathImpl<ArrayKey, V>
  : {
      [K in keyof T]-?: PathImpl<K & string, T[K]>;
    }[keyof T];

/** Path<T> for RHF FieldValues  */
export type FieldPath<TFieldValues extends FieldValues> = Path<TFieldValues>;

/** Same concept as PathImpl, but only allow string literal paths to array sub-elements */
type ArrayPathImpl<K extends string | number, V> = V extends Primitive
  ? never
  : V extends Array<infer U>
  ? U extends Primitive
    ? never
    : `${K}` | `${K}.${ArrayPath<V>}`
  : `${K}.${ArrayPath<V>}`;

/** All paths for arrays and tuples  */
export type ArrayPath<T> = T extends Array<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKey<T>]-?: ArrayPathImpl<K & string, T[K]>;
      }[TupleKey<T>]
    : ArrayPathImpl<ArrayKey, V>
  : {
      [K in keyof T]-?: ArrayPathImpl<K & string, T[K]>;
    }[keyof T];

export type FieldArrayPath<TFieldValues extends FieldValues> =
  ArrayPath<TFieldValues>;

/** Extract the actual value out of the path */
export type PathValue<T, P extends Path<T> | ArrayPath<T>> = T extends any
  ? P extends `${infer K}.${infer Rest}`
    ? // if using dot notation and pre-dot string is a valid prop of T
      K extends keyof T
      ? // If the property after the dot is a valid child path, recurse into it
        Rest extends Path<T[K]>
        ? PathValue<T[K], Rest>
        : never
      : // if the property after the dot is valid Array key (a number) and the child is an array, recurse with the array type in mind
      K extends `${ArrayKey}`
      ? T extends Array<infer V>
        ? PathValue<V, Rest & Path<V>>
        : never
      : never
    : // if supplied non-dot-notation path a property of T, then resolve the type
    P extends keyof T
    ? T[P]
    : // if supplied non-dot-notation path an Array key and field is an array, resolve the value
    P extends `${ArrayKey}`
    ? T extends Array<infer V>
      ? V
      : never
    : never
  : never;

export type FieldPathValue<
  TFieldValues extends FieldValues,
  TFieldPath extends FieldPath<TFieldValues>,
> = PathValue<TFieldValues, TFieldPath>;

export type FieldArrayPathValue<
  TFieldValues extends FieldValues,
  TFieldArrayPath extends FieldArrayPath<TFieldValues>,
> = PathValue<TFieldValues, TFieldArrayPath>;

export type FieldPathValues<
  TFieldValues extends FieldValues,
  TPath extends FieldPath<TFieldValues>[],
> = {} & {
  [K in keyof TPath]: FieldPathValue<
    TFieldValues,
    TPath[K] & FieldPath<TFieldValues>
  >;
};

type UnionKeys<T> = T extends any ? keyof T : never;

type UnionValues<T, K> = T extends any
  ? K extends keyof T
    ? T[K]
    : never
  : never;

type OptionalKeys<T> = T extends any
  ? { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T]
  : never;

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type UnionLike<T> = [T] extends [Date | FileList | File | NestedValue]
  ? T
  : [T] extends [Array<any>]
  ? { [K in keyof T]: UnionLike<T[K]> }
  : [T] extends [object]
  ? PartialBy<
      {
        [K in UnionKeys<T>]: UnionLike<UnionValues<T, K>>;
      },
      Exclude<UnionKeys<T>, keyof T> | OptionalKeys<T>
    >
  : T;
