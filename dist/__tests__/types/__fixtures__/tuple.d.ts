declare type ConcatTupleTenTimes<T extends unknown[]> = [
    ...T,
    ...T,
    ...T,
    ...T,
    ...T,
    ...T,
    ...T,
    ...T,
    ...T,
    ...T
];
export declare type HundredTuple<T> = ConcatTupleTenTimes<ConcatTupleTenTimes<[T]>>;
export {};
//# sourceMappingURL=tuple.d.ts.map