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
  it.each([null, undefined])(
    'return empty FormData for a top-level %s value',
    (value) => {
      expect(Array.from(jsonToFormData(value))).toEqual([]);
    },
  );

  it('preserve null leaf values while omitting undefined values', () => {
    const formData = jsonToFormData({
      name: 'bill',
      empty: null,
      omitted: undefined,
      nested: { empty: null, omitted: undefined },
      values: [null, undefined],
    });

    expect(Array.from(formData)).toEqual([
      ['name', 'bill'],
      ['empty', 'null'],
      ['nested.empty', 'null'],
      ['values.0', 'null'],
    ]);
  });

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
});
