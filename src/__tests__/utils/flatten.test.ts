import { flatten } from '../../utils/flatten';

describe('flatten', () => {
  it('should flatten form values into flat form data', () => {
    expect(
      flatten({
        hey: 'test',
        array: [
          {
            test: '1',
            test2: '2',
            test3: null,
          },
        ],
        test: {
          nested: {
            test: 'bill',
            test3: null,
          },
        },
        test1: null,
      }),
    ).toMatchSnapshot();
  });

  it('should preserve Date values as leaf nodes and not drop them', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');

    expect(flatten({ name: 'Alice', createdAt: date, age: 30 })).toEqual({
      name: 'Alice',
      createdAt: date,
      age: 30,
    });
  });

  it('should preserve nested Date values as leaf nodes', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-12-31');

    expect(flatten({ range: { start, end }, label: 'year' })).toEqual({
      'range.start': start,
      'range.end': end,
      label: 'year',
    });
  });

  it('should preserve File and Blob values as leaf nodes and not drop them', () => {
    const file = new File(['content'], 'resume.pdf');
    const blob = new Blob(['content']);

    expect(flatten({ name: 'Alice', resume: file, avatar: blob })).toEqual({
      name: 'Alice',
      resume: file,
      avatar: blob,
    });
  });

  it('should preserve nested and indexed File values as leaf nodes', () => {
    const first = new File(['1'], 'first.pdf');
    const second = new File(['2'], 'second.pdf');

    expect(
      flatten({ profile: { resume: first }, attachments: [second] }),
    ).toEqual({
      'profile.resume': first,
      'attachments.0': second,
    });
  });

  it('should preserve FileList values as leaf nodes and not split them', () => {
    const fileList = Object.create(FileList.prototype) as FileList;
    const file = new File(['1'], 'first.pdf');

    Object.defineProperty(fileList, 0, { value: file, enumerable: true });
    Object.defineProperty(fileList, 'length', { value: 1 });

    expect(flatten({ name: 'Alice', attachments: fileList })).toEqual({
      name: 'Alice',
      attachments: fileList,
    });
  });
});
