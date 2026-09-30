import { jsonToFormData } from '../../utils/formData';

const createFileList = (files: File[]) => {
  const fileList = Object.create(FileList.prototype) as FileList;

  files.forEach((file, index) => {
    Object.defineProperty(fileList, index, { value: file, enumerable: true });
  });
  Object.defineProperty(fileList, 'length', { value: files.length });

  return fileList;
};

describe('jsonToFormData', () => {
  it('should skip undefined values instead of stringifying them', () => {
    const formData = jsonToFormData({ name: 'bill', nick: undefined });

    expect(formData.get('name')).toBe('bill');
    expect(formData.has('nick')).toBe(false);
  });

  it('should skip null values instead of stringifying them', () => {
    const formData = jsonToFormData({
      name: 'bill',
      nick: null,
      address: { line1: '1 Main St', line2: null },
    });

    expect(formData.get('name')).toBe('bill');
    expect(formData.has('nick')).toBe(false);
    expect(formData.get('address.line1')).toBe('1 Main St');
    expect(formData.has('address.line2')).toBe(false);
  });

  it('should submit FileList values under their field name', () => {
    const resume = createFileList([
      new File(['a'], 'a.txt'),
      new File(['b'], 'b.txt'),
    ]);

    const formData = jsonToFormData({
      name: 'bill',
      resume,
    });

    expect(formData.get('name')).toBe('bill');
    expect(formData.getAll('resume')).toHaveLength(2);
  });
});
