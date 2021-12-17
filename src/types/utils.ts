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

export type DeepPartial<T> = T extends Date | FileList | File | NestedValue
  ? T
  : { [K in keyof T]?: DeepPartial<T[K]> };

export type DeepPartialSkipArrayKey<T> = T extends
  | Date
  | FileList
  | File
  | NestedValue
  ? T
  : T extends ReadonlyArray<any>
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

export type IsFlatObject<T extends object> = Extract<
  Exclude<T[keyof T], NestedValue | Date | FileList>,
  any[] | object
> extends never
  ? true
  : false;
