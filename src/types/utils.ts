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

export type EmptyObject = { [K in string | number]: never };

export type NonUndefined<T> = T extends undefined ? never : T;

export type LiteralUnion<T extends U, U extends Primitive> =
  | T
  | (U & { _?: never });

export type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends { [key in keyof T]: T[key] }
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export type IsAny<T> = boolean extends (T extends never ? true : false)
  ? true
  : false;

export type DeepMap<T, TValue> = {
  [K in keyof T]?: IsAny<T[K]> extends true
    ? any
    : NonUndefined<T[K]> extends NestedValue | Date | FileList
    ? TValue
    : NonUndefined<T[K]> extends object
    ? DeepMap<T[K], TValue>
    : NonUndefined<T[K]> extends Array<infer U>
    ? IsAny<U> extends true
      ? Array<any>
      : U extends NestedValue | Date | FileList
      ? Array<TValue>
      : U extends object
      ? Array<DeepMap<U, TValue>>
      : Array<TValue>
    : TValue;
};

export type IsFlatObject<T extends object> = Extract<
  Exclude<T[keyof T], NestedValue | Date | FileList>,
  any[] | object
> extends never
  ? true
  : false;

type IsPrimitive<T> = T extends Primitive ? true : false;
type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
  ? false
  : true;
type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;
type ArrayKey = number;

type PathImpl<K, V> = K extends string | number
  ? V extends Primitive
    ? `${K}`
    : `${K}` | `${K}.${Path<V>}`
  : never;

export type Path<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T & any[]> extends true
    ? {
        [K in TupleKey<T>]-?: PathImpl<K, T[K]>;
      }[TupleKey<T>]
    : PathImpl<ArrayKey, V>
  : {
      [K in keyof T]-?: PathImpl<K, T[K]>;
    }[keyof T];

export type FieldPath<TFieldValues extends FieldValues> = Path<TFieldValues>;

export type ArrayPath<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T & any[]> extends true
    ? `${TupleKey<T & any[]> & string}.${ArrayPath<V>}`
    : `${ArrayKey}.${ArrayPath<V>}`
  : {
      [K in keyof T]: IsPrimitive<T[K]> extends true
        ? never
        : T[K] extends ReadonlyArray<infer V>
        ? IsPrimitive<V> extends true
          ? never
          : IsFlatObject<V & object> extends true
          ? K & string
          : (K & string) | `${K & string}.${ArrayPath<T[K]>}`
        : `${K & string}.${ArrayPath<T[K]>}`;
    }[keyof T];

export type FieldArrayPath<
  TFieldValues extends FieldValues
> = ArrayPath<TFieldValues>;

export type PathValue<
  T,
  P extends Path<T> | ArrayPath<T>
> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? R extends Path<T[K]>
      ? PathValue<T[K], R>
      : never
    : K & ArrayKey extends keyof T
    ? PathValue<T[K & ArrayKey], R & Path<T[K & ArrayKey]>>
    : never
  : P extends keyof T
  ? T[P]
  : P & ArrayKey extends keyof T
  ? T[P & ArrayKey]
  : never;

export type FieldPathValue<
  TFieldValues extends FieldValues,
  TFieldPath extends FieldPath<TFieldValues>
> = PathValue<TFieldValues, TFieldPath>;

export type FieldArrayPathValue<
  TFieldValues extends FieldValues,
  TFieldArrayPath extends FieldArrayPath<TFieldValues>
> = PathValue<TFieldValues, TFieldArrayPath>;

export type FieldPathValues<
  TFieldValues extends FieldValues,
  TPath extends FieldPath<TFieldValues>[]
> = {} & {
  [K in keyof TPath]: FieldPathValue<
    TFieldValues,
    TPath[K] & FieldPath<TFieldValues>
  >;
};
