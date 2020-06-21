export default (objectA: any = {}, objectB: any = {}) => {
  const objectAKeys = Object.keys(objectA);

  return (
    objectAKeys.length === Object.keys(objectB).length &&
    objectAKeys.every((key) => objectB[key] && objectB[key] === objectA[key])
  );
};
