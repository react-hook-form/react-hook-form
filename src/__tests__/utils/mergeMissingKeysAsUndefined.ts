import mergeMissingKeysAsUndefined from '../../utils/mergeMissingKeysAsUndefined';

describe('mergeMissingKeysAsUndefined', () => {
  it('should preserve existing keys in newRules', () => {
    const oldRules = { min: 1, max: 10 };
    const newRules = { min: 5 };
    const result = mergeMissingKeysAsUndefined(oldRules, newRules);
    expect(result).toEqual({ min: 5, max: undefined });
  });

  it('should return all keys as undefined when newRules is undefined', () => {
    const oldRules = { required: true, minLength: 2 };
    const result = mergeMissingKeysAsUndefined(oldRules, undefined);
    expect(result).toEqual({ required: undefined, minLength: undefined });
  });

  it('should return newRules unchanged if all keys match oldRules', () => {
    const oldRules = { required: true };
    const newRules = { required: false };
    const result = mergeMissingKeysAsUndefined(oldRules, newRules);
    expect(result).toEqual({ required: false });
  });

  it('should ignore extra keys in newRules not in oldRules', () => {
    const oldRules = { required: true };
    const newRules = { required: false, maxLength: 10 };
    const result = mergeMissingKeysAsUndefined(oldRules, newRules);
    expect(result).toEqual({ required: false, maxLength: 10 });
  });

  it('should return an empty object if oldRules is undefined', () => {
    const result = mergeMissingKeysAsUndefined(undefined, { a: 1 });
    expect(result).toEqual({ a: 1 });
  });

  it('should return an empty object if both inputs are undefined', () => {
    const result = mergeMissingKeysAsUndefined(undefined, undefined);
    expect(result).toEqual({});
  });
});
