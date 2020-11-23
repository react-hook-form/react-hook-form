import { getPath } from './getPath';

describe('getPath', () => {
  it('should generate the correct path', () => {
    expect(
      getPath<any>('test', [
        1,
        [1, 2],
        {
          data: 'test',
          kidding: { test: 'data' },
          foo: { bar: {} },
          what: [{ bill: { haha: 'test' } }, [3, 4]],
          one: 1,
          empty: null,
          absent: undefined,
          isAwesome: true,
          answer: Symbol(42),
        },
      ]),
    ).toEqual([
      'test[0]',
      'test[1][0]',
      'test[1][1]',
      'test[2].data',
      'test[2].kidding.test',
      'test[2].what[0].bill.haha',
      'test[2].what[1][0]',
      'test[2].what[1][1]',
      'test[2].one',
      'test[2].empty',
      'test[2].absent',
      'test[2].isAwesome',
      'test[2].answer',
    ]);

    expect(
      getPath<any>('test', {
        test: 1,
        test1: [1, 2],
        test2: {
          data: 'test',
          kidding: { test: 'data' },
          foo: { bar: {} },
          what: [{ bill: { haha: 'test' } }, [3, 4]],
          one: 1,
          empty: null,
          absent: undefined,
          isAwesome: true,
          answer: Symbol(42),
        },
      }),
    ).toEqual([
      'test.test',
      'test.test1[0]',
      'test.test1[1]',
      'test.test2.data',
      'test.test2.kidding.test',
      'test.test2.what[0].bill.haha',
      'test.test2.what[1][0]',
      'test.test2.what[1][1]',
      'test.test2.one',
      'test.test2.empty',
      'test.test2.absent',
      'test.test2.isAwesome',
      'test.test2.answer',
    ]);
  });
});
