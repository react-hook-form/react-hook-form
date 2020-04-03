export default (objectA: any = {}, objectB: any = {}) => {
  const objectAData = Object.entries(objectA);
  const objectBData = Object.keys(objectB);
  return (
    objectAData.length === objectBData.length &&
    objectAData.reduce(
      (previous, [key, value]) =>
        previous ? objectB[key] && objectB[key] === value : false,
      true,
    )
  );
};
