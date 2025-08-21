import mergeMissingKeysAsUndefined from '../../utils/mergeMissingKeysAsUndefined';

describe('mergeMissingKeysAsUndefined', () => {
  it('should return undefined when newObject is undefined', () => {
    const result = mergeMissingKeysAsUndefined({ a: 1 }, undefined);
    expect(result).toBeUndefined();
  });

  it('should return newObject when oldObject is undefined', () => {
    const newObject = { a: 1, b: 2 };
    const result = mergeMissingKeysAsUndefined(undefined, newObject);
    expect(result).toEqual(newObject);
  });

  it('should merge and set missing keys to undefined', () => {
    const oldObject = { a: 1, b: 2, c: 3 };
    const newObject = { a: 10, d: 4 };
    const result = mergeMissingKeysAsUndefined(oldObject, newObject);

    expect(result).toEqual({
      a: 10,
      d: 4,
      b: undefined,
      c: undefined,
    });
  });

  it('should handle empty objects', () => {
    const result = mergeMissingKeysAsUndefined({}, { a: 1 });
    expect(result).toEqual({ a: 1 });
  });

  it('should handle when both objects are empty', () => {
    const result = mergeMissingKeysAsUndefined({}, {});
    expect(result).toEqual({});
  });

  it('should preserve all keys from newObject and add undefined for missing keys from oldObject', () => {
    const oldObject = { required: true, minLength: 5, maxLength: 10 };
    const newObject = { required: false, pattern: /test/ };
    const result = mergeMissingKeysAsUndefined(oldObject, newObject);

    expect(result).toEqual({
      required: false,
      pattern: /test/,
      minLength: undefined,
      maxLength: undefined,
    });
  });
});
