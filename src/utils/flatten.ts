function flatten<T>(list: T[]): T[] {
  return list.reduce(
    (a: any, b: any) => a.concat(Array.isArray(b) ? flatten(b) : b),
    [],
  );
}

export default flatten;
