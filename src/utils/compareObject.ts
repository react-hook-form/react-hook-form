export default (objectA: any = {}, objectB: any = {}) => {
  const objectAKeys = Object.keys(objectA);
  const objectBKeys = Object.keys(objectB);
  return (
    objectAKeys.length === objectBKeys.length &&
    objectAKeys.every((key) => objectB[key] && objectB[key] === objectA[key])
  );
};
