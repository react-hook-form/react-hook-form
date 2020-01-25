export default (objectA: any = {}, objectB: any = {}) =>
  Object.entries(objectA).reduce(
    (previous, [key, value]) =>
      previous ? objectB[key] && objectB[key] === value : false,
    true,
  );
