import getPath from './getPath';

describe('getPath', () => {
  it('should generate the correct path', () => {
    expect(
      getPath('test', [
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
  });
});
