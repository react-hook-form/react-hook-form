import isFileInput from '../../utils/isFileInput';

describe('isFileInput', () => {
  it('return true when type is file', () => {
    expect(isFileInput({ name: 'test', type: 'file' })).toBeTruthy();
  });
});
