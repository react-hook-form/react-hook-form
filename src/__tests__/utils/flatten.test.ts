import { flatten } from '../../utils/flatten';

class DateValue {
  $y: number;
  $M: number;
  $D: number;
  $d: Date;

  constructor(iso: string) {
    this.$d = new Date(iso);
    this.$y = this.$d.getUTCFullYear();
    this.$M = this.$d.getUTCMonth();
    this.$D = this.$d.getUTCDate();
  }

  toJSON() {
    return this.$d.toISOString();
  }
}

describe('flatten', () => {
  it('flatten form values into flat form data', () => {
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

  it('preserve Date values as leaf nodes and not drop them', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');

    expect(flatten({ name: 'Alice', createdAt: date, age: 30 })).toEqual({
      name: 'Alice',
      createdAt: date,
      age: 30,
    });
  });

  it('preserve nested Date values as leaf nodes', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-12-31');

    expect(flatten({ range: { start, end }, label: 'year' })).toEqual({
      'range.start': start,
      'range.end': end,
      label: 'year',
    });
  });

  it('preserve File and Blob values as leaf nodes and not drop them', () => {
    const file = new File(['content'], 'resume.pdf');
    const blob = new Blob(['content']);

    expect(flatten({ name: 'Alice', resume: file, avatar: blob })).toEqual({
      name: 'Alice',
      resume: file,
      avatar: blob,
    });
  });

  it('preserve nested and indexed File values as leaf nodes', () => {
    const first = new File(['1'], 'first.pdf');
    const second = new File(['2'], 'second.pdf');

    expect(
      flatten({ profile: { resume: first }, attachments: [second] }),
    ).toEqual({
      'profile.resume': first,
      'attachments.0': second,
    });
  });

  it('preserve FileList values as leaf nodes and not split them', () => {
    const fileList = Object.create(FileList.prototype) as FileList;
    const file = new File(['1'], 'first.pdf');

    Object.defineProperty(fileList, 0, { value: file, enumerable: true });
    Object.defineProperty(fileList, 'length', { value: 1 });

    expect(flatten({ name: 'Alice', attachments: fileList })).toEqual({
      name: 'Alice',
      attachments: fileList,
    });
  });

  it('use the toJSON value of a class instance instead of its fields', () => {
    expect(
      flatten({
        name: 'bill',
        startDate: new DateValue('2026-10-13T00:00:00.000Z'),
      }),
    ).toEqual({
      name: 'bill',
      startDate: '2026-10-13T00:00:00.000Z',
    });
  });

  it('use the toJSON value of nested and indexed class instances', () => {
    expect(
      flatten({
        range: { start: new DateValue('2026-10-13T00:00:00.000Z') },
        dates: [new DateValue('2026-10-14T00:00:00.000Z')],
      }),
    ).toEqual({
      'range.start': '2026-10-13T00:00:00.000Z',
      'dates.0': '2026-10-14T00:00:00.000Z',
    });
  });

  it('flatten a class instance without toJSON into its fields', () => {
    class Address {
      city = 'Kyiv';
      zip = '01001';
    }

    expect(flatten({ address: new Address() })).toEqual({
      'address.city': 'Kyiv',
      'address.zip': '01001',
    });
  });

  it('flatten an object whose toJSON is not a function', () => {
    expect(flatten({ settings: { toJSON: 'on', theme: 'dark' } })).toEqual({
      'settings.toJSON': 'on',
      'settings.theme': 'dark',
    });
  });

  it('flatten a class instance whose toJSON returns an object', () => {
    class Address {
      _city = 'Kyiv';
      _zip = '01001';

      toJSON() {
        return { city: this._city, zip: this._zip };
      }
    }

    expect(flatten({ address: new Address() })).toEqual({
      'address.city': 'Kyiv',
      'address.zip': '01001',
    });
  });
});
