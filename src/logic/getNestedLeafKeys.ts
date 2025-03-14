export default function getNestedLeafKeys(obj: any, prefix = ''): string[] {
  // If the input is not an object or is null, return an empty array.
  if (typeof obj !== 'object' || obj === null) {
    return [];
  }
  let keys: string[] = [];
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    // If the value is a non-null object, not an array, and has keys, then recurse.
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length > 0
    ) {
      keys = keys.concat(getNestedLeafKeys(value, fullKey));
    } else {
      // For arrays and primitives (or empty objects), treat the current key as a leaf.
      keys.push(fullKey);
    }
  }
  return keys;
}
