import pickErrors from './pickErrors';

describe('pickErrors', () => {
  it('should pick the associated errors', () => {
    expect(
      pickErrors(
        {
          // @ts-ignore
          test: {},
          // @ts-ignore
          test1: {},
          // @ts-ignore
          test2: {},
          // @ts-ignore
          test3: {},
        },
        ['test', 'test1'],
      ),
    ).toEqual({
      test: {},
      test1: {},
    });
  });
});
