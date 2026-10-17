import isCheckBoxInput from '../../utils/isCheckBoxInput';

describe('isCheckBoxInput', () => {
  it('return true when type is checkbox', () => {
    expect(isCheckBoxInput({ name: 'test', type: 'checkbox' })).toBeTruthy();
  });
});
