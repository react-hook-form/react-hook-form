import cloneObject from './cloneObject';

describe('clone', () => {
  it('should clone object and not mutate the orginal object', () => {
    const data = {
      test: {
        date: new Date('2020-10-15'),
        test0: 12,
        test1: '12',
        test2: [1, 2, 3, 4],
        deep: {
          date: new Date('2020-10-15'),
          test0: 12,
          test1: '12',
          test2: [1, 2, 3, 4],
        },
      },
    };

    const copy = cloneObject(data);
    expect(cloneObject(data)).toEqual(copy);

    // @ts-ignore
    copy.test.what = '1243';
    copy.test.date = new Date('2020-10-116');

    expect(data).toEqual({
      test: {
        date: new Date('2020-10-15'),
        test0: 12,
        test1: '12',
        test2: [1, 2, 3, 4],
        deep: {
          date: new Date('2020-10-15'),
          test0: 12,
          test1: '12',
          test2: [1, 2, 3, 4],
        },
      },
    });
  });
});
