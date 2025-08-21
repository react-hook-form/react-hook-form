export default function mergeMissingKeysAsUndefined<
  T extends Record<string, any>,
>(oldObject: T | undefined, newObject: T | undefined): T | undefined {
  if (!newObject) {
    return newObject;
  }

  const result = { ...newObject };

  if (oldObject) {
    for (const key in oldObject) {
      if (!(key in result)) {
        (result as any)[key] = undefined;
      }
    }
  }

  return result;
}
