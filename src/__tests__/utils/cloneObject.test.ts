import cloneObject from '../../utils/cloneObject';

describe('clone', () => {
  it('should clone object and not mutate the original object', () => {
    const fileData = new File([''], 'filename');
    const data = {
      items: [],
      test: {
        date: new Date('2020-10-15'),
        test0: 12,
        test1: '12',
        test2: [1, 2, 3, 4],
        deep: {
          date: new Date('2020-10-15'),
          test0: 12,
          test1: '12',
          test2: [
            1,
            2,
            3,
            4,
            {
              file: fileData,
            },
          ],
          file: fileData,
        },
      },
      file: fileData,
      test2: new Set([1, 2]),
      test1: new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]),
    };

    const copy = cloneObject(data);
    expect(cloneObject(data)).toEqual(copy);

    // @ts-ignore
    copy.test.what = '1243';
    copy.test.date = new Date('2020-10-16');
    // @ts-ignore
    copy.items[0] = 2;

    expect(data).toEqual({
      items: [],
      test: {
        date: new Date('2020-10-15'),
        test0: 12,
        test1: '12',
        test2: [1, 2, 3, 4],
        deep: {
          date: new Date('2020-10-15'),
          test0: 12,
          test1: '12',
          test2: [
            1,
            2,
            3,
            4,
            {
              file: fileData,
            },
          ],
          file: fileData,
        },
      },
      file: fileData,
      test2: new Set([1, 2]),
      test1: new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]),
    });

    // @ts-ignore
    data.items = [1, 2, 3];

    expect(copy.items).toEqual([2]);
  });

  it('should copy prototype methods', () => {
    class Counter {
      count = 1;
      increment() {
        this.count++;
      }
    }
    const counter = new Counter();
    const copy = cloneObject(counter);

    expect(copy.count).toBe(1);
    expect(typeof copy.increment).toBe('function');
  });

  it('should copy prototype methods with private fields', () => {
    class Counter {
      #value;
      constructor() {
        this.#value = 1;
      }
      get count() {
        return this.#value;
      }
      increment() {
        this.#value++;
      }
    }
    const counter = new Counter();
    const copy = cloneObject(counter);

    expect(copy.count).toBe(1);
    expect(typeof copy.increment).toBe('function');
  });
});
