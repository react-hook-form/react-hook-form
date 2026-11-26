import isFileList from '../../utils/isFileList';

describe('isFileList', () => {
  it('return true for a FileList', () => {
    const input = document.createElement('input');
    input.type = 'file';

    expect(isFileList(input.files)).toBeTruthy();
  });

  it('return false for an array of files', () => {
    expect(isFileList([new File([''], 'test.txt')])).toBeFalsy();
  });
});
