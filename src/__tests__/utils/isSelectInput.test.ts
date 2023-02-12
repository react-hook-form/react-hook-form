import isRadioInput from '../../core/utils/isSelectInput';

describe('isSelectInput', () => {
  it('should return true when type is select-one', () => {
    expect(isRadioInput({ name: 'test', type: 'select-one' })).toBeTruthy();
  });
});
