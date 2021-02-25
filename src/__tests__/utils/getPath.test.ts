import { getPath } from '../../utils/getPath';

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
    ).toMatchSnapshot();

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
    ).toMatchSnapshot();
  });
});
