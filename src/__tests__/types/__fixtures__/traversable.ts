interface Base<T, V> {
  foo: T;
  bar: [T];
  baz: Array<T>;
  value: V;
}

type NullableBase<T, V> = null | undefined | Partial<Base<T, V>>;

export type InfiniteType<T> = Base<InfiniteType<T>, T>;

export type NullableInfiniteType<T> = NullableBase<InfiniteType<T>, T>;

export type Depth3Type<T> = Base<Base<Base<never, T>, T>, T>;

export type NullableDepth2Type<T> = NullableBase<NullableBase<never, T>, T>;
