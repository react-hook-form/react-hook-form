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

export type Assign<T extends object, U extends object> = T & Omit<U, keyof T>;

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

type Digits = '0' | NonZeroDigits;
type NonZeroDigits = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type IsPrimitive<T> = T extends Primitive ? true : false;

type ArrayKey = number | Digits | `${NonZeroDigits}${Digits}`;

type ValueOf<T> = T[keyof T];

export type FieldPath<Root> = Root extends ReadonlyArray<infer E>
  ? IsPrimitive<E> extends true
    ? ArrayKey
    : ArrayKey | `${ArrayKey}.${FieldPath<E>}`
  : ValueOf<
      {
        [K in keyof Root]: IsPrimitive<Root[K]> extends true
          ? K & string
          : (K & string) | `${K & string}.${FieldPath<Root[K]>}`;
      }
    >;

export type FieldPathValue<
  TFieldValues extends FieldValues,
  TPath extends FieldPath<TFieldValues>
> = TPath extends `${infer Key}.${infer Rest}`
  ? Key extends keyof TFieldValues
    ? Rest extends FieldPath<TFieldValues[Key]>
      ? FieldPathValue<TFieldValues[Key], Rest>
      : TFieldValues[Key] extends (infer U)[]
      ? U
      : never
    : Key extends Digits
    ? Key & number extends keyof TFieldValues
      ? Rest extends FieldPath<TFieldValues[Key & number]>
        ? FieldPathValue<TFieldValues[Key & number], Rest>
        : TFieldValues[Key] extends (infer U)[]
        ? U
        : never
      : never
    : never
  : TPath extends keyof TFieldValues
  ? TFieldValues[TPath]
  : TPath & number extends keyof TFieldValues
  ? TFieldValues[TPath & number]
  : never;

export type FieldPathValues<
  TFieldValues extends FieldValues,
  TPath extends FieldPath<TFieldValues>[]
> = {} & {
  [K in keyof TPath]: FieldPathValue<
    TFieldValues,
    TPath[K] & FieldPath<TFieldValues>
  >;
};
