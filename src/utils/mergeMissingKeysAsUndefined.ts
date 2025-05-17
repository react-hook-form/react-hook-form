export default (oldObject?: any, newObject?: any) => {
  const result = { ...(newObject || {}) };

  for (const key in oldObject) {
    if (newObject === undefined || !Object.hasOwn(newObject, key)) {
      (result as any)[key] = undefined;
    }
  }
  return result;
};
