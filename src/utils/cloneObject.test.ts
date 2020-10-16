import cloneObject from './cloneObject';

describe('clone', () => {
  it('should clone object and not mutate the orginal object', () => {
    const data = {
      test: {
        test: '12',
        test1: [1, 2, 3, 4],
        date: new Date('2020-10-15'),
        deep: {
          date: new Date('2020-10-15'),
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
        test: '12',
        test1: [1, 2, 3, 4],
        date: new Date('2020-10-15'),
        deep: {
          date: new Date('2020-10-15'),
        },
      },
    });
  });
});
