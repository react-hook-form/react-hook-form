export function type<T>(): T {
  throw new Error(
    'This function should never be run. It may only be statically analyzed by tsd.',
  );
}
