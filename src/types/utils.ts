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

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type LastOf<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;

type Push<T extends any[], V> = [...T, V];

export type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

type ArrayElementType<A> = A extends readonly (infer T)[] ? T : never;

type Indexes = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type PathFinder<
  TFieldValues,
  Key extends keyof TFieldValues = keyof TFieldValues
> = Key extends string
  ? TFieldValues[Key] extends NestedValue | FileList
    ? Key
    : TFieldValues[Key] extends (string | boolean | number | symbol)[]
    ? `${Key}.${Indexes}`
    : TFieldValues[Key] extends object[]
    ? `${Key}.${Indexes}.${PathFinder<ArrayElementType<TFieldValues[Key]>>}`
    : TFieldValues[Key] extends Record<string, any>
    ? `${Key}.${PathFinder<TFieldValues[Key]>}`
    : Key
  : never;

type GenerateArrayKeyType<T extends string, K extends number> = `${T}.${K}`;

type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends readonly unknown[]
    ? GenerateArrayKeyType<Key, Indexes>
    : T[Key] extends Record<string, any>
    ? // | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> &
      //     string}`
      `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never;

type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;

export type Path<T> = PathImpl2<T> extends string | keyof T
  ? PathImpl2<T>
  : keyof T;

// export type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}`
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
