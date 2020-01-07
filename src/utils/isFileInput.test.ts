import isFileInput from './isFileInput';

describe('isFileInput', () => {
  it('should return true when type is file', () => {
    expect(isFileInput('file')).toBeTruthy();
  });
});
