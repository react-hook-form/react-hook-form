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

  it('submit a class instance as its toJSON value', () => {
    class DateValue {
      $d = new Date('2026-10-13T00:00:00.000Z');

      toJSON() {
        return this.$d.toISOString();
      }
    }

    const formData = jsonToFormData({
      name: 'bill',
      startDate: new DateValue(),
    });

    expect(Array.from(formData.keys())).toEqual(['name', 'startDate']);
    expect(formData.get('startDate')).toBe('2026-10-13T00:00:00.000Z');
  });
});
