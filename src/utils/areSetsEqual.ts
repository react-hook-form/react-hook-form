export default <T>(object1: Set<T>, object2: Set<T>): boolean =>
  object1.size === object2.size && [...object1].every((x) => object2.has(x));
