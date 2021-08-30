import { FieldValues } from './fields';
import { NestedValue } from './form';

export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

export type Builtin = NestedValue | Date | FileList | File;

export type EmptyObject = { [K in string | number]: never };

export type NonUndefined<T> = T extends undefined ? never : T;

export type LiteralUnion<T extends U, U extends Primitive> =
  | T
  | (U & { _?: never });

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export type IsAny<T> = boolean extends (T extends never ? true : false)
  ? true
  : false;

export type DeepMap<T, TValue> = IsAny<T> extends true
  ? any
  : T extends undefined | null
  ? never
  : T extends Builtin
  ? TValue
  : T extends Array<infer U>
  ? Array<DeepMap<U, TValue>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepMap<U, TValue>>
  : T extends object
  ? { [K in keyof T]: DeepMap<T[K], TValue> }
  : TValue;

export type IsFlatObject<T extends object> = Extract<
  Exclude<T[keyof T], Builtin>,
  any[] | object
> extends never
  ? true
  : false;

type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
  ? false
  : true;
type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;
type ArrayKey = number;

type PathImpl<K extends string | number, V> = V extends Primitive
  ? `${K}`
  : `${K}` | `${K}.${Path<V>}`;

export type Path<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKey<T>]-?: PathImpl<K & string, T[K]>;
      }[TupleKey<T>]
    : PathImpl<ArrayKey, V>
  : {
      [K in keyof T]-?: PathImpl<K & string, T[K]>;
    }[keyof T];

export type FieldPath<TFieldValues extends FieldValues> = Path<TFieldValues>;

type ArrayPathImpl<K extends string | number, V> = V extends Primitive
  ? never
  : V extends ReadonlyArray<infer U>
  ? U extends Primitive
    ? never
    : `${K}` | `${K}.${ArrayPath<V>}`
  : `${K}.${ArrayPath<V>}`;

export type ArrayPath<T> = T extends ReadonlyArray<infer V>
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

export type PathValue<
  T,
  P extends Path<T> | ArrayPath<T>,
> = P extends `${infer K}.${infer R}`
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
  TPath extends FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[],
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

export type UnionLike<T> = [T] extends [Builtin]
  ? T
  : [T] extends [ReadonlyArray<infer U>]
  ? { [K in keyof T]: UnionLike<U> }
  : [T] extends [object]
  ? PartialBy<
      {
        [K in UnionKeys<T>]: UnionLike<UnionValues<T, K>>;
      },
      Exclude<UnionKeys<T>, keyof T> | OptionalKeys<T>
    >
  : T;
