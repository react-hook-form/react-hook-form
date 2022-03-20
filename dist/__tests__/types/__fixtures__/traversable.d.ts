interface Base<T, V> {
    foo: T;
    bar: [T];
    baz: Array<T>;
    value: V;
}
export declare type InfiniteType<T> = Base<InfiniteType<T>, T>;
export declare type NullableInfiniteType<T> = null | undefined | Partial<Base<NullableInfiniteType<T>, T>>;
export declare type Depth3Type<T> = Base<Base<Base<never, T>, T>, T>;
export interface Nested<T> {
    nested: T;
}
export {};
//# sourceMappingURL=traversable.d.ts.map