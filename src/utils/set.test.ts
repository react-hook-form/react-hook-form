import { isKey } from './set';

describe('isKey', () => {
  it('should return false if it is array', () => {
    expect(isKey([])).toBeFalsy();
  });
});
