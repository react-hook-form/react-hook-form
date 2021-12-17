export type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
  ? false
  : true;

export type TupleKey<T extends ReadonlyArray<any>> = Exclude<
  keyof T,
  keyof any[]
>;

export type ArrayKey = number;
