export default <T>(value: Array<T> | ReadonlyArray<T> | T): Array<T> =>
  Array.isArray(value) ? (value as Array<T>) : ([value] as Array<T>);
