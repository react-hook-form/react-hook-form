import { isMatchFieldArrayName } from './isNameInFieldArray';

describe('isMatchFieldArrayName', () => {
  it('should find match array field', () => {
    expect(isMatchFieldArrayName('test[0]', 'test')).toBeTruthy();
    expect(isMatchFieldArrayName('test[0]', 'test1')).toBeFalsy();
    expect(
      isMatchFieldArrayName('test[0].data[0]', 'test[0].data'),
    ).toBeTruthy();
    expect(
      isMatchFieldArrayName('test[0].data[0]', 'test[1].data'),
    ).toBeFalsy();
  });
});
