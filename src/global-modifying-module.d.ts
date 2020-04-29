interface Set<T> {
  add(value: T): Set<T>;
  clear(): void;
  delete(value: T): boolean;
  entries(): IterableIterator<[T, T]>;
  forEach(
    callbackfn: (value: T, index: T, set: Set<T>) => void,
    thisArg?: any,
  ): void;
  has(value: T): boolean;
  keys(): IterableIterator<T>;
  size: number;
  values(): IterableIterator<T>;
  [Symbol.iterator](): IterableIterator<T>;
  [Symbol.toStringTag]: string;
}

interface SetConstructor {
  new <T>(): Set<T>;
  new <T>(iterable: Iterable<T>): Set<T>;
  prototype: Set<any>;
}
declare var Set: SetConstructor;
