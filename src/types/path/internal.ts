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
export type AsKey<T> = Extract<T, Key>;
export type ToKey<T> = T extends ArrayKey ? `${T}` : AsKey<T>;

export type KeyList = Key[];
export type AsKeyList<T> = Extract<T, KeyList>;

export type SplitPathString<
  PS extends PathString,
  _KL extends KeyList = [],
> = PS extends `${infer K}.${infer R}`
  ? SplitPathString<R, [..._KL, K]>
  : [..._KL, PS];

type JoinKeyListHelper<KL extends KeyList, PS extends PathString> = KL extends [
  infer K,
  ...infer R
]
  ? JoinKeyListHelper<AsKeyList<R>, `${PS}.${AsKey<K>}`>
  : PS;

export type JoinKeyList<KL extends KeyList> = KL extends [infer K, ...infer R]
  ? JoinKeyListHelper<AsKeyList<R>, AsKey<K>>
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
