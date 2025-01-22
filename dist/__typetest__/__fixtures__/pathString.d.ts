type ConcatTenTimes<T extends string> = `${T}.${T}.${T}.${T}.${T}.${T}.${T}.${T}.${T}.${T}`;
export type HundredPathString<T extends string> = ConcatTenTimes<ConcatTenTimes<T>>;
export {};
//# sourceMappingURL=pathString.d.ts.map