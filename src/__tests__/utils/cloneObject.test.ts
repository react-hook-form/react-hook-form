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
      testSet: new Set([1, 2]),
      testMap: new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]),
      testMap2: new Map([['test', { test0: 12, test1: '12' }]]),
    };

    const copy = cloneObject(data);
    expect(data).toEqual(copy);

    // @ts-expect-error
    copy.test.what = '1243';
    copy.test.date = new Date('2020-10-16');
    // @ts-expect-error
    copy.items[0] = 2;
    copy.testSet.add(3);
    copy.testMap.set(4, 'four');
    // @ts-expect-error
    copy.testMap2.get('test').test1 = '13';

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
      testSet: new Set([1, 2]),
      testMap: new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]),
      testMap2: new Map([['test', { test0: 12, test1: '12' }]]),
    });

    // @ts-expect-error
    data.items = [1, 2, 3];

    expect(copy.items).toEqual([2]);
  });

  it('should skip clone if a node contains function', () => {
    function testFunction() {}

    const test = {
      data: {
        testFunction,
      },
      other: 'string',
    };

    expect(cloneObject(test)).toEqual({
      data: {
        testFunction,
      },
      other: 'string',
    });
  });
});
