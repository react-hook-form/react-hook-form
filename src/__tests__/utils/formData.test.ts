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
  it('skip undefined values instead of stringifying them', () => {
    const formData = jsonToFormData({ name: 'bill', nick: undefined });

    expect(formData.get('name')).toBe('bill');
    expect(formData.has('nick')).toBe(false);
  });

  it('skip null values instead of stringifying them', () => {
    const formData = jsonToFormData({
      name: 'bill',
      gender: null,
      tags: ['a', null],
    });

    expect(formData.get('name')).toBe('bill');
    expect(formData.has('gender')).toBe(false);
    expect(formData.get('tags.0')).toBe('a');
    expect(formData.has('tags.1')).toBe(false);
  });

  it('submit FileList values under their field name', () => {
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
