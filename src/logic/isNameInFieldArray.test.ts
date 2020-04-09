import { isMatchFieldArrayName } from './isNameInFieldArray';

describe('isMatchFieldArrayName', () => {
  it('should find match array field', () => {
    expect(isMatchFieldArrayName('test[0]', 'test')).toBeTruthy();
    expect(isMatchFieldArrayName('test[0]', 'test1')).toBeFalsy();
  });

  it('should find match array field when index is provided', () => {
    expect(isMatchFieldArrayName('test[0]', 'test', 0)).toBeTruthy();
    expect(isMatchFieldArrayName('test[0]', 'test', 1)).toBeFalsy();
  });
});
