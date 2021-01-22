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

export type LiteralToPrimitive<T extends any> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T;

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

// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
//   k: infer I,
// ) => void
//   ? I
//   : never;

// type LastOf<T> = UnionToIntersection<
//   T extends any ? () => T : never
// > extends () => infer R
//   ? R
//   : never;
//
// type Push<T extends any[], V> = [...T, V];

// export type TuplifyUnion<
//   T,
//   L = LastOf<T>,
//   N = [T] extends [never] ? true : false
// > = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

// type ArrayElementType<A> = A extends readonly (infer T)[] ? T : never;

// type Indexes =
//   | 0
//   | 1
//   | 2
//   | 3
//   | 4
//   | 5
//   | 6
//   | 7
//   | 8
//   | 9
//   | 10
//   | 11
//   | 12
//   | 13
//   | 14
//   | 15
//   | 16
//   | 17
//   | 18
//   | 19
//   | 20
//   | 21
//   | 22
//   | 23
//   | 24
//   | 25
//   | 26
//   | 27
//   | 28
//   | 29
//   | 30;

// type ArrayChild = string | boolean | number | symbol | bigint;

// type Pred = [never, 0, 1, 2, 3, 4, 5, 6, 7];

// export type FieldPath<
//   TFieldValues,
//   TKey extends keyof TFieldValues = keyof TFieldValues,
//   TMaxRecursive extends number = 7
// > = [TMaxRecursive] extends [0]
//   ? 'RECURSIVE_EXCEED'
//   : TKey extends string
//   ? TFieldValues[TKey] extends NestedValue | FileList
//     ? TKey
//     : TFieldValues[TKey] extends ArrayChild[] | Set<ArrayChild>
//     ? `${TKey}.${Indexes}`
//     : TFieldValues[TKey] extends object[]
//     ? `${TKey}.${Indexes}.${FieldPath<
//         ArrayElementType<TFieldValues[TKey]>,
//         keyof ArrayElementType<TFieldValues[TKey]>,
//         Pred[TMaxRecursive]
//       >}`
//     : TFieldValues[TKey] extends Record<string, any>
//     ? `${TKey}.${FieldPath<
//         TFieldValues[TKey],
//         keyof TFieldValues[TKey],
//         Pred[TMaxRecursive]
//       >}`
//     : TKey
//   : never;

// type GenerateArrayKeyType<T extends string, K extends number> = `${T}.${K}`;

// type PathImpl<T, Key extends keyof T> = Key extends string
//   ? T[Key] extends readonly unknown[]
//     ? GenerateArrayKeyType<Key, Indexes>
//     : T[Key] extends Record<string, any>
//     ? // | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>>}`
//       `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
//     : never
//   : never;

// type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;

// export type Path<T> = PathImpl2<T> extends string | keyof T
//   ? PathImpl2<T>
//   : keyof T;

// export type PathValue<
//   T,
//   P extends Path<T>
// > = P extends `${infer Key}.${infer Rest}`
//   ? Key extends keyof T
//     ? Rest extends Path<T[Key]>
//       ? PathValue<T[Key], Rest>
//       : T[Key] extends (infer U)[]
//       ? U
//       : never
//     : never
//   : P extends keyof T
//   ? T[P]
//   : never;

type Digits = '0' | NonZeroDigits;
type NonZeroDigits = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type IsPrimitive<T> = T extends Primitive ? true : false;

type ArrayKey = number | Digits | `${NonZeroDigits}${Digits}`;
// | `${NonZeroDigits}${Digits}${Digits}`;

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
