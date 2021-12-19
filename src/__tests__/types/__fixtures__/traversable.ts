export interface InfiniteType<T> {
  foo: InfiniteType<T>;
  bar: [InfiniteType<T>];
  baz: Array<InfiniteType<T>>;
  value: T;
}
