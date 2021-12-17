export type Traversable = object | ReadonlyArray<any>;

export type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
  ? false
  : true;

export type TupleKey<T extends ReadonlyArray<any>> = Exclude<
  keyof T,
  keyof any[]
>;

export type ArrayKey = number;

export type PathString = string;

export type Key = string;
export type AsKey<T> = T extends ArrayKey ? `${T}` : Extract<T, Key>;

export type KeyList = Key[];
export type AsKeyList<T> = Extract<T, KeyList>;

type SplitPathStringTailRecursive<
  PS extends PathString,
  KL extends KeyList,
> = PS extends `${infer K}.${infer R}`
  ? SplitPathStringTailRecursive<R, [...KL, K]>
  : [...KL, PS];

export type SplitPathString<PS extends PathString> =
  SplitPathStringTailRecursive<PS, []>;

type JoinKeyListTailRecursive<
  KL extends KeyList,
  PS extends PathString,
> = KL extends [infer K, ...infer R]
  ? JoinKeyListTailRecursive<AsKeyList<R>, `${PS}.${AsKey<K>}`>
  : PS;

export type JoinKeyList<KL extends KeyList> = KL extends [infer K, ...infer R]
  ? JoinKeyListTailRecursive<AsKeyList<R>, AsKey<K>>
  : never;

export type EvaluateKeyList<T, KL extends KeyList> = KL extends [
  infer K,
  ...infer R
]
  ? K extends keyof T
    ? EvaluateKeyList<T[K], AsKeyList<R>>
    : K extends `${ArrayKey}`
    ? T extends ReadonlyArray<infer V>
      ? EvaluateKeyList<V, AsKeyList<R>>
      : never
    : never
  : T;
