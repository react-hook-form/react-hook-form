import isFileInput from '../../core/utils/isFileInput';

describe('isFileInput', () => {
  it('should return true when type is file', () => {
    expect(isFileInput({ name: 'test', type: 'file' })).toBeTruthy();
  });
});
